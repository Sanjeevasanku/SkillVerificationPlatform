const Repository = require('../models/Repository');
const Skill = require('../models/Skill');
const parseGitHubUrl = require('../utils/parseGitHubUrl');
const verificationService = require('../services/verificationService');
const skillDetectionService = require('../services/skillDetectionService');
const Student = require('../models/Student');
const githubService = require('../services/githubService');

/**
 * @desc    Verify and create repository
 * @route   POST /api/repositories
 * @access  Private (Student only)
 */
exports.createRepository = async (req, res) => {
    const { title, description, githubLink } = req.body;

    // 1. Basic Validation
    if (!title || !description || !githubLink) {
        return res.status(400).json({
            message: "Missing required fields",
            reason: "Title, description, and GitHub link are mandatory"
        });
    }

    if (title.length < 3) {
        return res.status(400).json({
            message: "Invalid Title",
            reason: "Title must be at least 3 characters long"
        });
    }

    if (description.length < 10) {
        return res.status(400).json({
            message: "Invalid Description",
            reason: "Description must be at least 10 characters long"
        });
    }

    try {
        // 2. Parse GitHub URL
        const parsedUrl = parseGitHubUrl(githubLink);
        if (!parsedUrl) {
            return res.status(400).json({
                message: "Repository verification failed",
                reason: "Invalid GitHub URL format"
            });
        }

        const { owner, repo } = parsedUrl;

        // 3. Get Student Context
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        if (!student.githubId) {
            return res.status(400).json({
                message: "Registration incomplete",
                reason: "You must link your GitHub account before submitting repositories"
            });
        }

        // 4. Verify Repository (Ownership & Contribution)
        let verificationResult;
        try {
            verificationResult = await verificationService.verifyRepository(student, owner, repo);
        } catch (error) {
            return res.status(400).json({
                message: "Repository verification failed",
                reason: error.message
            });
        }

        const { repoMetadata, totalCommitCount, commitCountByStudent, contributionPercentage } = verificationResult;

        // 5. Check duplicate submission by same student
        const exists = await Repository.exists({
            student: student._id,
            repoId: repoMetadata.repoId
        });

        if (exists) {
            return res.status(400).json({
                message: "Repository verification failed",
                reason: "You have already submitted this repository"
            });
        }

        // 6. Save Repository
        const newRepo = new Repository({
            student: student._id,
            title,
            description,
            githubLink: repoMetadata.githubLink,
            repoId: repoMetadata.repoId,
            repoName: repoMetadata.repoName,
            repoOwner: repoMetadata.repoOwner,
            repoOwnerId: repoMetadata.repoOwnerId,
            repoOwnerType: repoMetadata.repoOwnerType,
            isFork: repoMetadata.isFork,
            isArchived: repoMetadata.isArchived,
            primaryLanguage: repoMetadata.primaryLanguage,
            stars: repoMetadata.stars,
            forks: repoMetadata.forks,
            totalCommitCount,
            commitCountByStudent,
            contributionPercentage,
            verificationStatus: 'verified'
        });

        await newRepo.save();

        // 7. Trigger Skill Extraction (Async background process for immediate frontend response)
        // We don't 'await' this so the user is redirected immediately
        skillDetectionService.detectSkills(owner, repo).then(async (detectedSkills) => {
            // Upsert each skill into the Skill collection (keyed by student + name)
            const skillIds = await Promise.all(
                detectedSkills.map(skill =>
                    Skill.findOneAndUpdate(
                        { student: student._id, name: skill.name },
                        {
                            $set: {
                                category: skill.category,
                                confidenceScore: skill.confidenceScore,
                                evidence: skill.evidence
                            }
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    ).then(doc => doc._id)
                )
            );

            newRepo.skills = skillIds;
            await newRepo.save();
            console.log(`[SkillDetection] Background analysis complete for ${owner}/${repo}. Saved ${skillIds.length} skills.`);
        }).catch(extractError => {
            console.error('Background skill extraction failed:', extractError.message);
        });

        res.status(201).json({
            message: "Repository verification initiated. Analysis running in background.",
            repositoryId: newRepo._id
        });

    } catch (err) {
        console.error('Error in createRepository:', err.message);
        res.status(500).json({
            message: "Server error",
            reason: "An internal error occurred during verification"
        });
    }
};

/**
 * @desc    Get all repositories belonging to the authenticated student
 * @route   GET /api/repositories/my
 * @access  Private (Student only)
 */
exports.getMyRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('skills');

        res.json(repositories);
    } catch (err) {
        console.error('Error in getMyRepositories:', err.message);
        res.status(500).json({ message: "Server error" });
    }
};
