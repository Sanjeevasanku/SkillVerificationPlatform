/**
 * codeScanner.js
 * Scans code files for import, usage patterns, and file extensions.
 */

const scanCodeFiles = (fileContentsArray, skillMap) => {
    const detectionResults = {};

    // Initialize results for all skills
    Object.keys(skillMap).forEach(key => {
        detectionResults[key] = {
            importsDetected: false,
            usagesDetected: false,
            fileIndicatorsDetected: false,
            evidence: []
        };
    });

    fileContentsArray.forEach(({ path, content }) => {
        const extension = '.' + path.split('.').pop();

        Object.keys(skillMap).forEach(skillKey => {
            const rules = skillMap[skillKey];
            const result = detectionResults[skillKey];

            // 1. Check File Indicators (Extensions or specific filenames)
            if (rules.fileIndicators && rules.fileIndicators.some(ind => path.endsWith(ind))) {
                if (!result.fileIndicatorsDetected) {
                    result.fileIndicatorsDetected = true;
                    result.evidence.push(`File indicator: ${path.split('/').pop()}`);
                }
            }

            // Skip usage scan for massive files or if already fully detected
            if (content) {
                const lowerContent = content.toLowerCase();

                // 2. Check Import Patterns
                if (!result.importsDetected && rules.importPatterns) {
                    const match = rules.importPatterns.find(pat => lowerContent.includes(pat.toLowerCase()));
                    if (match) {
                        result.importsDetected = true;
                        result.evidence.push(`Import pattern: ${match}`);
                    }
                }

                // 3. Check Usage Patterns
                if (!result.usagesDetected && rules.usagePatterns) {
                    const match = rules.usagePatterns.find(pat => lowerContent.includes(pat.toLowerCase()));
                    if (match) {
                        result.usagesDetected = true;
                        result.evidence.push(`Usage pattern: ${match}`);
                    }
                }
            }
        });
    });

    return detectionResults;
};

module.exports = { scanCodeFiles };
