/**
 * skillDetectionService.js
 * Main service to coordinate repo traversal and skill extraction.
 * Supports two modes:
 *   1. "llm"   — Uses local Ollama LLM for intelligent, open-ended skill extraction
 *   2. "rules" — Uses the original rule-based engine (skillMap + codeScanner + confidenceCalculator)
 */

const githubService = require('./githubService');
const ollamaService = require('./ollamaService');

// Rule-based engine imports (kept as fallback)
const skillMap = require('../config/skillMap');
const { parseDependencies } = require('../utils/dependencyParser');
const { scanCodeFiles } = require('../utils/codeScanner');
const { calculateConfidence } = require('../utils/confidenceCalculator');

const MAX_FILES = 150;
const MAX_DEPTH = 8;
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', 'docs', 'test', 'tests', '__pycache__', '.vscode', '.idea', 'target', 'bin', 'obj', '.gradle', '.mvn'];

// Max characters per file to include in LLM prompt (to stay within context limits)
const MAX_FILE_CHARS = 3000;
// Max total prompt size in characters (~4 chars per token, target ~8K tokens for code context)
const MAX_PROMPT_CHARS = 32000;

/**
 * Recursively fetch file metadata and content (within limits)
 */
async function getRepoFiles(owner, repo) {
    const allFiles = [];
    let filesScanned = 0;

    async function traverse(path = "", depth = 0) {
        if (depth > MAX_DEPTH || filesScanned >= MAX_FILES) return;

        const contents = await githubService.fetchRepoContents(owner, repo, path);
        if (!contents || !Array.isArray(contents)) return;

        for (const item of contents) {
            if (filesScanned >= MAX_FILES) break;

            if (item.type === 'dir') {
                if (!IGNORED_DIRS.includes(item.name)) {
                    await traverse(item.path, depth + 1);
                }
            } else if (item.type === 'file') {
                const isCodeFile = /\.(js|jsx|ts|tsx|py|java|html|css|json|yml|yaml|xml|md|sh|txt|ipynb|go|rs|rb|php|c|cpp|h|hpp|cs|swift|kt|scala|r|sql|graphql|proto|toml|cfg|ini)$/i.test(item.name);

                if (isCodeFile) {
                    const content = await githubService.fetchFileContent(owner, repo, item.path);
                    if (content) {
                        allFiles.push({
                            path: item.path,
                            content: content
                        });
                        filesScanned++;
                    } else {
                        console.warn(`[SkillDetection] Could not fetch content for ${item.path}`);
                    }
                }
            }
        }
    }

    console.log(`[SkillDetection] Starting traversal for ${owner}/${repo}...`);
    await traverse();
    console.log(`[SkillDetection] Traversal finished. Found ${allFiles.length} valid code files.`);
    return allFiles;
}

// ============================================================================
//  LLM-POWERED SKILL EXTRACTION (Ollama)
// ============================================================================

/**
 * Build a structured prompt containing repo file contents for the LLM.
 * Prioritizes important files (manifests, configs) and includes code snippets.
 * @param {Array} files - Array of { path, content }
 * @returns {string} - Formatted context string
 */
function buildRepoContext(files) {
    // Priority order: manifest files first, then config files, then source code
    const priority = {
        'package.json': 1,
        'requirements.txt': 1,
        'Pipfile': 1,
        'Gemfile': 1,
        'pom.xml': 1,
        'build.gradle': 1,
        'go.mod': 1,
        'Cargo.toml': 1,
        'composer.json': 1,
        'Dockerfile': 2,
        'docker-compose.yml': 2,
        'docker-compose.yaml': 2,
        '.env.example': 2,
        'tsconfig.json': 2,
        'tailwind.config.js': 2,
        'next.config.js': 2,
        'vite.config.js': 2,
        'webpack.config.js': 2,
        '.babelrc': 2,
        'jest.config.js': 2,
        'README.md': 3,
    };

    const sorted = [...files].sort((a, b) => {
        const nameA = a.path.split('/').pop();
        const nameB = b.path.split('/').pop();
        const prioA = priority[nameA] || 10;
        const prioB = priority[nameB] || 10;
        return prioA - prioB;
    });

    // Build the file tree
    const fileTree = files.map(f => `  ${f.path}`).join('\n');

    let context = `## Project File Tree\n${fileTree}\n\n## File Contents\n`;
    let totalChars = context.length;

    for (const file of sorted) {
        const fileName = file.path.split('/').pop();
        const truncatedContent = file.content.length > MAX_FILE_CHARS
            ? file.content.substring(0, MAX_FILE_CHARS) + '\n... (truncated)'
            : file.content;

        const fileSection = `\n### ${file.path}\n\`\`\`\n${truncatedContent}\n\`\`\`\n`;

        if (totalChars + fileSection.length > MAX_PROMPT_CHARS) {
            context += `\n... (${sorted.indexOf(file)}/${sorted.length} files shown, remaining files omitted for brevity)\n`;
            break;
        }

        context += fileSection;
        totalChars += fileSection.length;
    }

    return context;
}

/**
 * Extract skills using Ollama LLM
 * @param {Array} files - Array of { path, content }
 * @returns {Promise<Array>} - Array of { name, category, confidenceScore, evidence }
 */
async function extractSkillsWithLLM(files) {
    const repoContext = buildRepoContext(files);

    const systemPrompt = `You are an expert software engineer performing a deep code analysis. Your job is to analyze a GitHub repository's ACTUAL CODE and identify all technologies, frameworks, libraries, and tools that are GENUINELY USED in the project.

ABSOLUTE RULE: You must ONLY report skills/technologies that you can see DIRECT EVIDENCE for in the provided code files below. If you do not see a technology imported, used, or configured in the files shown, DO NOT include it. NEVER guess or assume technologies. If only 1-2 files are provided, only report what those files show — do not hallucinate additional technologies.

CRITICAL RULES — READ CAREFULLY:

1. DO NOT trust package.json / requirements.txt alone. Dependencies listed in manifests may be installed but NEVER actually used in the code. You MUST cross-reference:
   - Is the dependency actually imported/required in any source file?
   - Is there real usage of its APIs, functions, or classes in the code?
   - If a dependency appears ONLY in package.json but is NEVER imported or used in any .js/.ts/.py file, give it a confidenceScore of 0.0 (exclude it).

2. Confidence scoring based on VERIFIED USAGE:
   - 0.9-1.0: Core technology — imported in many files, APIs used extensively (e.g., Express with app.get/post in multiple routes, React with JSX + hooks in many components)
   - 0.7-0.8: Significant usage — imported and actively used in several files
   - 0.5-0.6: Moderate usage — imported and used in 1-2 files
   - 0.4: Minimal but confirmed usage — imported at least once with at least one API call
   - BELOW 0.4: Do NOT include — not enough evidence of real usage

3. For each skill, provide SPECIFIC evidence from the actual code, such as:
   - "Imported via require('express') in server.js, app.get/app.post used in 5 route files"
   - "useState and useEffect hooks used in 8 component files"
   - NOT just "Found in package.json" — that alone is NOT sufficient evidence

4. Also detect technologies that have NO manifest entry but are clearly used:
   - CSS Grid/Flexbox patterns in stylesheets
   - REST API patterns, JWT authentication flows
   - Design patterns (MVC, middleware chains, etc.)
   - Languages (JavaScript, Python, etc.) based on file extensions and syntax

5. Categories: "Frontend Framework", "Backend Framework", "Database", "Language", "DevOps", "CSS Framework", "Testing", "Authentication", "State Management", "Build Tool", "API", "ORM/ODM", etc.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "skills": [
    {
      "name": "React",
      "category": "Frontend Framework",
      "confidenceScore": 0.9,
      "evidence": ["Imported in 12 component files via import React from 'react'", "JSX syntax used throughout", "Hooks: useState in 8 files, useEffect in 6 files, useContext in 3 files"]
    }
  ]
}`;

    const userPrompt = `Analyze this GitHub repository and extract all technologies/skills used:\n\n${repoContext}`;

    console.log(`[SkillDetection] Sending ${repoContext.length} chars to Ollama for analysis...`);

    const result = await ollamaService.chatJSON([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], {
        temperature: 0.2,
        timeoutMs: 180000 // 3 minutes for large repos
    });

    // Validate and normalize the response
    const skills = result.skills || result;
    if (!Array.isArray(skills)) {
        throw new Error('LLM response does not contain a skills array');
    }

    // Normalize each skill
    return skills
        .filter(s => s.name && s.confidenceScore >= 0.4)
        .map(s => ({
            name: s.name.trim(),
            category: s.category || 'General',
            confidenceScore: Math.min(Math.max(s.confidenceScore, 0.4), 1.0),
            evidence: Array.isArray(s.evidence) ? s.evidence : [s.evidence || 'Detected by LLM analysis']
        }));
}

// ============================================================================
//  RULE-BASED SKILL EXTRACTION (Original — kept as fallback)
// ============================================================================

/**
 * Extract skills using the rule-based engine
 * @param {Array} files - Array of { path, content }
 * @returns {Array} - Array of { name, category, confidenceScore, evidence }
 */
function extractSkillsWithRules(files) {
    // 1. Parse Dependencies
    const { dependencyList, detectedFiles } = parseDependencies(files);
    console.log(`[SkillDetection] Detected manifest files: ${detectedFiles.join(', ')} `);
    console.log(`[SkillDetection] Found ${dependencyList.length} dependencies.`);

    // 2. Scan Code Files
    const scanResults = scanCodeFiles(files, skillMap);

    // 3. Evaluate each skill in skillMap
    const finalSkills = [];

    Object.keys(skillMap).forEach(skillKey => {
        const rules = skillMap[skillKey];
        const scanResult = scanResults[skillKey];

        const evidenceObj = {
            dependencyFound: rules.dependencyNames.some(d => dependencyList.includes(d.toLowerCase())),
            importFound: scanResult.importsDetected,
            usageFound: scanResult.usagesDetected,
            fileIndicatorFound: scanResult.fileIndicatorsDetected
        };

        // Double check file indicators from dependencyParser detectedFiles
        if (!evidenceObj.fileIndicatorFound && rules.fileIndicators) {
            if (rules.fileIndicators.some(ind => detectedFiles.includes(ind))) {
                evidenceObj.fileIndicatorFound = true;
                scanResult.evidence.push(`File indicator: ${rules.fileIndicators.find(ind => detectedFiles.includes(ind))} `);
            }
        }

        const confidenceScore = calculateConfidence(evidenceObj);

        if (confidenceScore >= 0.4) {
            console.log(`[SkillDetection] Found ${rules.name} with score ${confidenceScore} `);
            const evidenceList = [];
            if (evidenceObj.dependencyFound) evidenceList.push("Dependency in manifest");
            evidenceList.push(...scanResult.evidence);

            finalSkills.push({
                name: rules.name,
                category: rules.category,
                confidenceScore: confidenceScore,
                evidence: [...new Set(evidenceList)]
            });
        }
    });

    return finalSkills;
}

// ============================================================================
//  MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detect skills from a repository.
 * Uses LLM mode (Ollama) if available, falls back to rule-based engine.
 */
exports.detectSkills = async (owner, repo) => {
    try {
        console.log(`🔍 Detecting skills for ${owner} / ${repo}...`);

        // 1. Traverse and fetch files
        const files = await getRepoFiles(owner, repo);
        console.log(`[SkillDetection] Fetched ${files.length} code files for analysis.`);

        if (files.length === 0) {
            console.warn(`[SkillDetection] No files found for ${owner} / ${repo}.Check depth / limits.`);
            return [];
        }

        // 2. Choose detection mode
        const mode = process.env.SKILL_DETECTION_MODE || 'llm';

        if (mode === 'llm') {
            // Try LLM first, fall back to rules
            const ollamaReady = await ollamaService.isAvailable();

            if (ollamaReady) {
                try {
                    console.log(`[SkillDetection] Using LLM mode(Ollama: ${ollamaService.OLLAMA_MODEL})`);
                    const skills = await extractSkillsWithLLM(files);
                    console.log(`✅ LLM skill detection complete.Found ${skills.length} skills.`);
                    return skills;
                } catch (llmError) {
                    console.error(`[SkillDetection] LLM extraction failed: ${llmError.message} `);
                    console.log(`[SkillDetection] Falling back to rule - based detection...`);
                }
            } else {
                console.warn('[SkillDetection] Ollama server not available. Falling back to rule-based detection.');
            }
        }

        // 3. Rule-based fallback
        console.log('[SkillDetection] Using rule-based mode');
        const finalSkills = extractSkillsWithRules(files);
        console.log(`✅ Rule - based skill detection complete.Found ${finalSkills.length} skills.`);
        return finalSkills;

    } catch (err) {
        console.error('Error in detectSkills:', err.message);
        return []; // Return empty on failure to prevent crashing parent flow
    }
};
