const Repository = require('../models/Repository');
const groqService = require('../services/groqService');

/**
 * @desc    Start a skill test — generates round 1 questions
 * @route   POST /api/repositories/:id/test/start
 * @access  Private (Student only)
 */
exports.startTest = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id);

        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        // Ensure the repo belongs to this student
        if (repo.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if test was already taken
        if (repo.testScore !== undefined && repo.testScore !== null) {
            return res.status(400).json({
                message: 'Test already taken',
                reason: 'You have already completed the skill test for this repository'
            });
        }

        // Check if skills exist
        if (!repo.skills || repo.skills.length === 0) {
            return res.status(400).json({
                message: 'No skills detected',
                reason: 'This repository has no detected skills to test on'
            });
        }

        // Generate round 1 questions
        const questions = await groqService.generateQuestions(repo.skills, 1);

        res.json({
            round: 1,
            questions,
            repoTitle: repo.title,
            skills: repo.skills.map(s => ({ name: s.name, category: s.category }))
        });

    } catch (err) {
        console.error('Error in startTest:', err.message);
        res.status(500).json({
            message: 'Failed to generate test questions',
            reason: err.message
        });
    }
};

/**
 * @desc    Evaluate round 1 answers. If score < 2, store and done. If >= 2, generate round 2.
 * @route   POST /api/repositories/:id/test/evaluate
 * @access  Private (Student only)
 */
exports.evaluateRound1 = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        // answers: [{ id, difficulty, skill, question, answer }]
        // timeTaken: seconds elapsed so far

        if (!answers || !Array.isArray(answers) || answers.length !== 4) {
            return res.status(400).json({
                message: 'Invalid submission',
                reason: 'Exactly 4 answers are required for round 1'
            });
        }

        const repo = await Repository.findById(req.params.id);

        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        if (repo.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (repo.testScore !== undefined && repo.testScore !== null) {
            return res.status(400).json({ message: 'Test already completed' });
        }

        // Evaluate with Groq
        const evaluation = await groqService.evaluateAnswers(answers);
        const round1Score = evaluation.totalScore;

        if (round1Score < 2) {
            // Test complete — store score
            repo.testScore = round1Score;
            repo.testTimeTaken = timeTaken;
            await repo.save();

            return res.json({
                status: 'complete',
                round1Score,
                totalScore: round1Score,
                maxScore: 4,
                timeTaken,
                evaluation: evaluation.scores,
                message: 'Test complete. Score saved.'
            });
        }

        // Score >= 2 — generate round 2 questions
        const round2Questions = await groqService.generateQuestions(repo.skills, 2);

        res.json({
            status: 'continue',
            round1Score,
            evaluation: evaluation.scores,
            round: 2,
            questions: round2Questions,
            message: 'Good job! Answer 2 more expert-level questions.'
        });

    } catch (err) {
        console.error('Error in evaluateRound1:', err.message);
        res.status(500).json({
            message: 'Failed to evaluate answers',
            reason: err.message
        });
    }
};

/**
 * @desc    Evaluate round 2 answers and store final score
 * @route   POST /api/repositories/:id/test/final
 * @access  Private (Student only)
 */
exports.evaluateFinal = async (req, res) => {
    try {
        const { answers, timeTaken, round1Score } = req.body;
        // answers: [{ id, difficulty, skill, question, answer }]
        // timeTaken: total seconds (both rounds combined)
        // round1Score: score from round 1

        if (!answers || !Array.isArray(answers) || answers.length !== 2) {
            return res.status(400).json({
                message: 'Invalid submission',
                reason: 'Exactly 2 answers are required for round 2'
            });
        }

        if (round1Score === undefined || round1Score === null) {
            return res.status(400).json({
                message: 'Missing round 1 score',
                reason: 'Round 1 score is required for final evaluation'
            });
        }

        const repo = await Repository.findById(req.params.id);

        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        if (repo.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (repo.testScore !== undefined && repo.testScore !== null) {
            return res.status(400).json({ message: 'Test already completed' });
        }

        // Evaluate round 2 with Groq
        const evaluation = await groqService.evaluateAnswers(answers);
        const round2Score = evaluation.totalScore;

        // Calculate combined score
        const totalScore = round1Score + round2Score;

        // Store final results
        repo.testScore = totalScore;
        repo.testTimeTaken = timeTaken;
        await repo.save();

        res.json({
            status: 'complete',
            round1Score,
            round2Score,
            totalScore,
            maxScore: 6,
            timeTaken,
            evaluation: evaluation.scores,
            message: 'Test complete. Final score saved.'
        });

    } catch (err) {
        console.error('Error in evaluateFinal:', err.message);
        res.status(500).json({
            message: 'Failed to evaluate final answers',
            reason: err.message
        });
    }
};
