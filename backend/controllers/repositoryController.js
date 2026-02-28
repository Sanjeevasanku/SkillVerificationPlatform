const Repository = require('../models/Repository');
const parseGitHubUrl = require('../utils/parseGitHubUrl');
const verificationService = require('../services/verificationService');
const skillDetectionService = require('../services/skillDetectionService');
const Student = require('../models/Student');
const githubService = require('../services/githubService');
const consistencyService = require('../services/consistencyService');
const authenticityService = require('../services/authenticityService');

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

        // 6.5 Calculate Consistency Score
        try {
            const commitDates = await githubService.fetchCommitDates(owner, repo);
            const consistency = consistencyService.calculateCommitConsistency(commitDates);

            newRepo.commitConsistencyScore = consistency.consistencyScore;
            newRepo.firstCommitDate = consistency.firstCommitDate;
            newRepo.lastCommitDate = consistency.lastCommitDate;
            newRepo.activeWeeks = consistency.activeWeeks;
        } catch (scoringError) {
            console.error('Commit consistency calculation failed:', scoringError.message);
        }

        // 6.6 Calculate Authenticity Score
        newRepo.projectAuthenticityScore = authenticityService.calculateAuthenticityScore(
            repoMetadata,
            contributionPercentage
        );

        await newRepo.save();

        // 7. Trigger Skill Extraction (Async background process for immediate frontend response)
        // We don't 'await' this so the user is redirected immediately
        skillDetectionService.detectSkills(owner, repo).then(async (skills) => {
            newRepo.skills = skills;
            await newRepo.save();
            console.log(`[SkillDetection] Background analysis complete for ${owner}/${repo}`);
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
            .sort({ createdAt: -1 });

        res.json(repositories);
    } catch (err) {
        console.error('Error in getMyRepositories:', err.message);
        res.status(500).json({ message: "Server error" });
    }
};
/**
 * @desc    Recalculate scores for a project
 * @route   PUT /api/repositories/:id/recalculate
 * @access  Private (Student only)
 */
exports.recalculateScores = async (req, res) => {
    try {
        const repo = await Repository.findOne({ _id: req.params.id, student: req.user.id });
        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        const parsedUrl = parseGitHubUrl(repo.githubLink);
        const { owner, repo: repoName } = parsedUrl;

        // 1. Recalculate consistency
        try {
            const commitDates = await githubService.fetchCommitDates(owner, repoName);
            const consistency = consistencyService.calculateCommitConsistency(commitDates);

            repo.commitConsistencyScore = consistency.consistencyScore;
            repo.firstCommitDate = consistency.firstCommitDate;
            repo.lastCommitDate = consistency.lastCommitDate;
            repo.activeWeeks = consistency.activeWeeks;
        } catch (error) {
            console.error('Recalculate consistency failed:', error.message);
        }

        // 2. Recalculate authenticity (using current stats)
        const student = await Student.findById(req.user.id);
        const verification = await verificationService.verifyRepository(student, owner, repoName);

        repo.totalCommitCount = verification.totalCommitCount;
        repo.commitCountByStudent = verification.commitCountByStudent;
        repo.contributionPercentage = verification.contributionPercentage;

        repo.projectAuthenticityScore = authenticityService.calculateAuthenticityScore(
            verification.repoMetadata,
            verification.contributionPercentage
        );

        await repo.save();

        res.json({
            commitConsistencyScore: repo.commitConsistencyScore,
            projectAuthenticityScore: repo.projectAuthenticityScore,
            contributionPercentage: repo.contributionPercentage
        });
    } catch (err) {
        console.error('Error in recalculateScores:', err.message);
        res.status(500).json({ message: "Server error during recalculation" });
    }
};
