/**
 * skillDetectionService.js
 * Main service to coordinate repo traversal and skill extraction.
 */

const githubService = require('./githubService');
const skillMap = require('../config/skillMap');
const { parseDependencies } = require('../utils/dependencyParser');
const { scanCodeFiles } = require('../utils/codeScanner');
const { calculateConfidence } = require('../utils/confidenceCalculator');

const MAX_FILES = 100;
const MAX_DEPTH = 3;
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', 'docs', 'test', 'tests'];

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
                const isCodeFile = /\.(js|jsx|ts|tsx|py|java|html|css|json|yml|yaml|xml|md|sh|txt|ipynb)$/i.test(item.name);

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

/**
 * Detect skills from a repository
 */
exports.detectSkills = async (owner, repo) => {
    try {
        console.log(`🔍 Detecting skills for ${owner}/${repo}...`);

        // 1. Traverse and fetch files
        const files = await getRepoFiles(owner, repo);
        console.log(`[SkillDetection] Fetched ${files.length} code files for analysis.`);

        if (files.length === 0) {
            console.warn(`[SkillDetection] No files found for ${owner}/${repo}. Check depth/limits.`);
        }

        // 2. Parse Dependencies
        const { dependencyList, detectedFiles } = parseDependencies(files);
        console.log(`[SkillDetection] Detected manifest files: ${detectedFiles.join(', ')}`);
        console.log(`[SkillDetection] Found ${dependencyList.length} dependencies.`);

        // 3. Scan Code Files
        const scanResults = scanCodeFiles(files, skillMap);

        // 4. Evaluate each skill in skillMap
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
                // Compile evidence list
                const evidenceList = [];
                if (evidenceObj.dependencyFound) evidenceList.push("Dependency in manifest");
                evidenceList.push(...scanResult.evidence);

                finalSkills.push({
                    name: rules.name,
                    category: rules.category,
                    confidenceScore: confidenceScore,
                    evidence: [...new Set(evidenceList)] // Unique evidence
                });
            }
        });

        console.log(`✅ Skill detection complete. Found ${finalSkills.length} skills.`);
        return finalSkills;

    } catch (err) {
        console.error('Error in detectSkills:', err.message);
        return []; // Return empty on failure to prevent crashing parent flow
    }
};
