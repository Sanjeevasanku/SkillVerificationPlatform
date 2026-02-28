const Skill = require('../models/Skill');
const Student = require('../models/Student');
const groqService = require('../services/groqService');

/**
 * @desc    Start a skill test — generates round 1 questions for a single skill
 * @route   POST /api/skills/test/start
 * @access  Private (Student only)
 */
exports.startTest = async (req, res) => {
    try {
        const { skillName } = req.body;
        const studentId = req.user.id;

        if (!skillName || !skillName.trim()) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

        // Check if test already taken for this skill
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const alreadyTaken = student.skillTestScores && student.skillTestScores.some(t => t.skillName === skillName);
        if (alreadyTaken) {
            return res.status(400).json({
                message: 'Test already taken',
                reason: `You have already completed the skill test for "${skillName}"`
            });
        }

        // Find the student's skill documents matching this name
        const skills = await Skill.find({ student: studentId, name: skillName });

        if (!skills || skills.length === 0) {
            return res.status(400).json({
                message: 'Skill not found',
                reason: `No verified skill "${skillName}" found in your profile`
            });
        }

        // Generate round 1 questions (pass as array for compatibility with groqService)
        const questions = await groqService.generateQuestions(skills, 1);

        res.json({
            round: 1,
            questions,
            skillName,
            skills: skills.map(s => ({ name: s.name, category: s.category }))
        });

    } catch (err) {
        console.error('Error in skill startTest:', err.message);
        res.status(500).json({
            message: 'Failed to generate test questions',
            reason: err.message
        });
    }
};

/**
 * @desc    Evaluate round 1 answers. If score < 2, store and done. If >= 2, generate round 2.
 * @route   POST /api/skills/test/evaluate
 * @access  Private (Student only)
 */
exports.evaluateRound1 = async (req, res) => {
    try {
        const { skillName, answers, timeTaken } = req.body;

        if (!skillName) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

        if (!answers || !Array.isArray(answers) || answers.length !== 4) {
            return res.status(400).json({
                message: 'Invalid submission',
                reason: 'Exactly 4 answers are required for round 1'
            });
        }

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const alreadyTaken = student.skillTestScores && student.skillTestScores.some(t => t.skillName === skillName);
        if (alreadyTaken) {
            return res.status(400).json({ message: 'Test already completed' });
        }

        // Evaluate with Groq
        const evaluation = await groqService.evaluateAnswers(answers);
        const round1Score = evaluation.totalScore;

        if (round1Score < 2) {
            // Test complete — store score on student (atomic push to avoid validation issues)
            await Student.updateOne(
                { _id: req.user.id },
                {
                    $push: {
                        skillTestScores: {
                            skillName,
                            score: round1Score,
                            maxScore: 4,
                            timeTaken,
                            takenAt: new Date()
                        }
                    }
                }
            );

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
        const skills = await Skill.find({ student: req.user.id, name: skillName });
        const round2Questions = await groqService.generateQuestions(skills, 2);

        res.json({
            status: 'continue',
            round1Score,
            evaluation: evaluation.scores,
            round: 2,
            questions: round2Questions,
            message: 'Good job! Answer 2 more expert-level questions.'
        });

    } catch (err) {
        console.error('Error in skill evaluateRound1:', err.message);
        res.status(500).json({
            message: 'Failed to evaluate answers',
            reason: err.message
        });
    }
};

/**
 * @desc    Evaluate round 2 answers and store final score
 * @route   POST /api/skills/test/final
 * @access  Private (Student only)
 */
exports.evaluateFinal = async (req, res) => {
    try {
        const { skillName, answers, timeTaken, round1Score } = req.body;

        if (!skillName) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

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

        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const alreadyTaken = student.skillTestScores && student.skillTestScores.some(t => t.skillName === skillName);
        if (alreadyTaken) {
            return res.status(400).json({ message: 'Test already completed' });
        }

        // Evaluate round 2 with Groq
        const evaluation = await groqService.evaluateAnswers(answers);
        const round2Score = evaluation.totalScore;

        // Calculate combined score
        const totalScore = round1Score + round2Score;

        // Store final results on student (atomic push to avoid validation issues)
        await Student.updateOne(
            { _id: req.user.id },
            {
                $push: {
                    skillTestScores: {
                        skillName,
                        score: totalScore,
                        maxScore: 6,
                        timeTaken,
                        takenAt: new Date()
                    }
                }
            }
        );

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
        console.error('Error in skill evaluateFinal:', err.message);
        res.status(500).json({
            message: 'Failed to evaluate final answers',
            reason: err.message
        });
    }
};
