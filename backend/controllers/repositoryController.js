const Repository = require('../models/Repository');
const parseGitHubUrl = require('../utils/parseGitHubUrl');
const verificationService = require('../services/verificationService');
const skillDetectionService = require('../services/skillDetectionService');
const Student = require('../models/Student');

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

        // 7. Trigger Skill Extraction (Background-like, but we await for the response in this phase)
        // Note: Real production apps might use a queue, but here we process it for immediate feedback.
        try {
            const skills = await skillDetectionService.detectSkills(owner, repo);
            newRepo.skills = skills;
            await newRepo.save();
        } catch (extractError) {
            console.error('Skill extraction failed:', extractError.message);
            // We don't fail the whole request because verification already passed
        }

        res.status(201).json({
            message: "Repository verified and skills extracted successfully",
            repositoryId: newRepo._id,
            skillsCount: newRepo.skills.length
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
            .sort({ createdAt: -1 });

        res.json(repositories);
    } catch (err) {
        console.error('Error in getMyRepositories:', err.message);
        res.status(500).json({ message: "Server error" });
    }
};
