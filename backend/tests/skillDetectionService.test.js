/**
 * skillDetectionService.test.js
 * Unit tests for internal functions of skillDetectionService
 */

const { normalizeSkillResults, filterAndDeduplicateSkills } = require('../services/skillDetectionService');

// Mock data
const mockLlmResult = {
    skills: [
        { name: "React", category: "Frontend", confidenceScore: 0.9, evidence: "Used hooks" },
        { name: "Node.js", category: "Backend", confidenceScore: 0.8, evidence: "Express usage" },
        { name: "Eslint", category: "Dev Tool", confidenceScore: 0.7, evidence: "Found in package.json" }, // Should be filtered
        { name: "mongo", category: "Database", confidenceScore: 0.8, evidence: "Mongoose models" }         // Should be deduped
    ]
};

describe('Skill Detection Service - Internal Functions', () => {

    describe('normalizeSkillResults', () => {
        it('should correctly normalize and filter by minimum confidence', () => {
            const rawResult = {
                skills: [
                    { name: "React", category: "Frontend", confidenceScore: 0.9, evidence: "Evidence 1" },
                    { name: "LowConf", category: "General", confidenceScore: 0.2, evidence: "Evidence 2" }
                ]
            };
            const normalized = normalizeSkillResults(rawResult);
            expect(normalized).toHaveLength(1);
            expect(normalized[0].name).toBe("React");
            expect(normalized[0].confidenceScore).toBe(0.9);
        });

        it('should handle non-array evidence and provide defaults', () => {
            const rawResult = {
                skills: [
                    { name: "Test", confidenceScore: 0.5 }
                ]
            };
            const normalized = normalizeSkillResults(rawResult);
            expect(Array.isArray(normalized[0].evidence)).toBe(true);
            expect(normalized[0].category).toBe("General");
        });
    });

    describe('filterAndDeduplicateSkills', () => {
        it('should filter out blacklisted skills', () => {
            const skills = [
                { name: "React", category: "Frontend", confidenceScore: 0.9, evidence: [] },
                { name: "eslint", category: "Tool", confidenceScore: 0.8, evidence: [] }
            ];
            const filtered = filterAndDeduplicateSkills(skills);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe("React");
        });

        it('should deduplicate and canonicalize skill names', () => {
            const skills = [
                { name: "mongo", category: "DB", confidenceScore: 0.7, evidence: ["Entry 1"] },
                { name: "MongoDB", category: "Database", confidenceScore: 0.9, evidence: ["Entry 2"] }
            ];
            const processed = filterAndDeduplicateSkills(skills);
            expect(processed).toHaveLength(1);
            expect(processed[0].name).toBe("MongoDB");
            expect(processed[0].confidenceScore).toBe(0.9);
            expect(processed[0].evidence).toContain("Entry 1");
            expect(processed[0].evidence).toContain("Entry 2");
        });

        it('should respect custom minConfidence threshold', () => {
            const skills = [
                { name: "SkillA", confidenceScore: 0.45, evidence: [] },
                { name: "SkillB", confidenceScore: 0.55, evidence: [] }
            ];
            const filtered = filterAndDeduplicateSkills(skills, 0.5);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe("SkillB");
        });
    });
});
