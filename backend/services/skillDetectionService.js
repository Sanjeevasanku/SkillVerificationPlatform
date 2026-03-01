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
function buildRepoContext(files, maxChars = MAX_PROMPT_CHARS) {
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

    // Reduce per-file limit for smaller context windows
    const perFileLimit = maxChars < 15000 ? 1500 : MAX_FILE_CHARS;

    for (const file of sorted) {
        const truncatedContent = file.content.length > perFileLimit
            ? file.content.substring(0, perFileLimit) + '\n... (truncated)'
            : file.content;

        const fileSection = `\n### ${file.path}\n\`\`\`\n${truncatedContent}\n\`\`\`\n`;

        if (totalChars + fileSection.length > maxChars) {
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
/**
 * Extract skills using Ollama LLM
 * Smaller context for local models (3B-7B) to avoid confusion
 * @param {Array} files - Array of { path, content }
 * @returns {Promise<Array>} - Array of { name, category, confidenceScore, evidence }
 */
async function extractSkillsWithOllama(files) {
    // Smaller context for local models — 12K chars (~3K tokens) to stay within 4K context window
    const OLLAMA_MAX_CHARS = 12000;
    const repoContext = buildRepoContext(files, OLLAMA_MAX_CHARS);
    const { systemPrompt, userPrompt } = buildSkillExtractionPrompt(repoContext);

    console.log(`[SkillDetection] Sending ${repoContext.length} chars to Ollama for analysis...`);

    const result = await ollamaService.chatJSON([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], {
        temperature: 0.2,
        timeoutMs: 180000
    });

    return normalizeSkillResults(result);
}

/**
 * Extract skills using Groq cloud LLM (fallback when Ollama is unavailable)
 * @param {Array} files - Array of { path, content }
 * @returns {Promise<Array>} - Array of { name, category, confidenceScore, evidence }
 */
async function extractSkillsWithGroq(files) {
    const Groq = require('groq-sdk');
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set');

    const groq = new Groq({ apiKey });
    const repoContext = buildRepoContext(files);
    const { systemPrompt, userPrompt } = buildSkillExtractionPrompt(repoContext);

    console.log(`[SkillDetection] Sending ${repoContext.length} chars to Groq for analysis...`);

    const MODELS = [
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'meta-llama/llama-4-scout-17b-16e-instruct'
    ];

    let lastError;
    for (const model of MODELS) {
        try {
            console.log(`[SkillDetection] Trying Groq model: ${model}`);
            const response = await groq.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.2,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from Groq');

            console.log(`[SkillDetection] Groq success with model: ${model}`);
            const parsed = JSON.parse(content);
            return normalizeSkillResults(parsed);
        } catch (err) {
            console.warn(`[SkillDetection] Groq model ${model} failed: ${err.message}`);
            lastError = err;
        }
    }
    throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
}

/**
 * Build the skill extraction prompt (shared between Ollama and Groq)
 */
function buildSkillExtractionPrompt(repoContext) {
    const systemPrompt = `You are an expert software engineer performing a deep code analysis. Your job is to analyze a GitHub repository's ACTUAL CODE and identify all technologies, frameworks, libraries, and tools that are GENUINELY USED in the project.

ABSOLUTE RULE: You must ONLY report skills/technologies that you can see DIRECT EVIDENCE for in the provided code files below. If you do not see a technology imported, used, or configured in the files shown, DO NOT include it. NEVER guess or assume technologies. If only 1-2 files are provided, only report what those files show — do not hallucinate additional technologies.

CRITICAL RULES — READ CAREFULLY:

1. DO NOT trust package.json / requirements.txt / pom.xml alone. Dependencies listed in manifests may be installed but NEVER actually used in the code. You MUST cross-reference:
   - Is the dependency actually imported/required in any source file?
   - Is there real usage of its APIs, functions, or classes in the code?
   - If a dependency appears ONLY in a manifest but is NEVER imported or used in any source file, give it a confidenceScore of 0.0 (exclude it).

2. Confidence scoring based on VERIFIED USAGE:
   - 0.9-1.0: Core technology — imported in many files, APIs used extensively
   - 0.7-0.8: Significant usage — imported and actively used in several files
   - 0.5-0.6: Moderate usage — imported and used in 1-2 files
   - 0.4: Minimal but confirmed usage — imported at least once with at least one API call
   - BELOW 0.4: Do NOT include — not enough evidence of real usage

3. For each skill, provide SPECIFIC evidence from the actual code, such as:
   - "Imported via require('express') in server.js, app.get/app.post used in 5 route files"
   - "useState and useEffect hooks used in 8 component files"
   - NOT just "Found in package.json" — that alone is NOT sufficient evidence

4. EXCLUDE the following — they are NOT skills a recruiter cares about:
   - Dev tools and linters: ESLint, Prettier, Babel, Webpack, Vite, Parcel, Rollup, TSLint, Stylelint
   - Package managers: npm, yarn, pnpm
   - Sub-libraries of a framework (group them under the parent):
     - React Router, React Query, React Hook Form, Redux Toolkit → just report "React" with higher confidence
     - Express middleware (cors, helmet, morgan) → just report "Express.js"
     - Mongoose plugins → just report "MongoDB/Mongoose"
   - Generic utilities: lodash, moment, dayjs, uuid, dotenv, axios (unless axios IS the core API layer)
   - Testing frameworks should ONLY be included if testing is a MAJOR part of the project

5. Also detect technologies that have NO manifest entry but are clearly used:
   - REST API design, GraphQL APIs
   - Authentication patterns (JWT, OAuth, session-based)
   - Database usage patterns
   - Languages (JavaScript, TypeScript, Python, Java, C++, etc.)

6. Categories: "Frontend Framework", "Backend Framework", "Database", "Language", "CSS Framework", "Authentication", "State Management", "Cloud/DevOps", "API", "ORM/ODM", "Machine Learning", etc.

7. Aim for 3-8 MAJOR skills per project. Do NOT list every tiny library. Think: "What would a recruiter put on a job listing?"

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "skills": [
    {
      "name": "React",
      "category": "Frontend Framework",
      "confidenceScore": 0.9,
      "evidence": ["Imported in 12 component files", "Hooks: useState, useEffect, useContext used extensively", "React Router for navigation, React Query for data fetching"]
    }
  ]
}`;

    const userPrompt = `Analyze this GitHub repository and extract all technologies/skills used:\n\n${repoContext}`;

    return { systemPrompt, userPrompt };
}

/**
 * Normalize LLM skill results into consistent format
 */
function normalizeSkillResults(result) {
    const skills = result.skills || result;
    if (!Array.isArray(skills)) {
        throw new Error('LLM response does not contain a skills array');
    }

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
    console.log(`[SkillDetection] Detected manifest files: ${detectedFiles.join(', ')}`);
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
                scanResult.evidence.push(`File indicator: ${rules.fileIndicators.find(ind => detectedFiles.includes(ind))}`);
            }
        }

        const confidenceScore = calculateConfidence(evidenceObj);

        if (confidenceScore >= 0.4) {
            console.log(`[SkillDetection] Found ${rules.name} with score ${confidenceScore}`);
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
 * Priority: Ollama (local) → Groq (cloud) → Rule-based (fallback)
 */
exports.detectSkills = async (owner, repo) => {
    try {
        console.log(`🔍 Detecting skills for ${owner}/${repo}...`);

        // 1. Traverse and fetch files
        const files = await getRepoFiles(owner, repo);
        console.log(`[SkillDetection] Fetched ${files.length} code files for analysis.`);

        if (files.length === 0) {
            console.warn(`[SkillDetection] No files found for ${owner}/${repo}. Check depth/limits.`);
            return [];
        }

        // 2. Choose detection mode
        const mode = process.env.SKILL_DETECTION_MODE || 'llm';

        if (mode === 'llm') {
            // Try Ollama first
            const ollamaReady = await ollamaService.isAvailable();
            if (ollamaReady) {
                try {
                    console.log(`[SkillDetection] Using Ollama LLM (${ollamaService.OLLAMA_MODEL})`);
                    const skills = await extractSkillsWithOllama(files);
                    console.log(` Ollama skill detection complete. Found ${skills.length} skills.`);
                    return skills;
                } catch (ollamaError) {
                    console.error(`[SkillDetection] Ollama failed: ${ollamaError.message}`);
                }
            } else {
                console.warn('[SkillDetection] Ollama not available.');
            }

            // Try Groq as second option
            if (process.env.GROQ_API_KEY) {
                try {
                    console.log('[SkillDetection] Trying Groq cloud LLM...');
                    const skills = await extractSkillsWithGroq(files);
                    console.log(` Groq skill detection complete. Found ${skills.length} skills.`);
                    return skills;
                } catch (groqError) {
                    console.error(`[SkillDetection] Groq failed: ${groqError.message}`);
                }
            }

            console.log('[SkillDetection] All LLM providers unavailable. Falling back to rule-based detection.');
        }

        // 3. Rule-based fallback
        console.log('[SkillDetection] Using rule-based mode');
        const finalSkills = extractSkillsWithRules(files);
        console.log(` Rule-based skill detection complete. Found ${finalSkills.length} skills.`);
        return finalSkills;

    } catch (err) {
        console.error('Error in detectSkills:', err.message);
        return [];
    }
};

