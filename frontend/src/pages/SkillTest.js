import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import api from '../lib/api';
import { ConfirmDialog } from '../components/common/Dialog';

const difficultyColors = {
    easy: '#057642',
    medium: '#eab308',
    hard: '#dc2626',
    hell: '#7c3aed',
    expert: '#be185d'
};

const difficultyLabels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    hell: 'Pro',
    expert: 'Expert'
};

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const SkillTest = () => {
    const { skillName: rawSkillName } = useParams();
    const skillName = decodeURIComponent(rawSkillName);
    const navigate = useNavigate();

    // State machine: 'loading' | 'round1' | 'evaluating' | 'round2' | 'results'
    const [phase, setPhase] = useState('loading');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [round1Score, setRound1Score] = useState(null);
    const [round1Evaluation, setRound1Evaluation] = useState(null);
    const [round2Evaluation, setRound2Evaluation] = useState(null);
    const [finalResult, setFinalResult] = useState(null);
    const [error, setError] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const timerRef = useRef(null);

    // Timer logic
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerRunning]);

    // Start test
    const startTest = useCallback(async () => {
        try {
            setPhase('loading');
            setError(null);
            const res = await api.post('/skills/test/start', { skillName });
            setQuestions(res.data.questions);
            setAnswers({});
            setPhase('round1');
            setTimerRunning(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start test');
            setPhase('error');
        }
    }, [skillName]);

    useEffect(() => {
        startTest();
    }, [startTest]);

    const handleAnswerChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    // Submit round 1
    const submitRound1 = async () => {
        // Validate all answered
        const unanswered = questions.filter(q => !answers[q.id]?.trim());
        if (unanswered.length > 0) {
            setError('Please answer all questions before submitting.');
            return;
        }

        setTimerRunning(false);
        setPhase('evaluating');
        setError(null);

        try {
            const payload = {
                skillName,
                answers: questions.map(q => ({
                    id: q.id,
                    difficulty: q.difficulty,
                    skill: q.skill,
                    question: q.question,
                    answer: answers[q.id],
                    correctAnswer: q.correctAnswer
                })),
                timeTaken: timer
            };

            const res = await api.post('/skills/test/evaluate', payload);

            setRound1Score(res.data.round1Score);
            setRound1Evaluation(res.data.evaluation);

            if (res.data.status === 'complete') {
                // Score < 2, test done
                setFinalResult({
                    totalScore: res.data.totalScore,
                    maxScore: res.data.maxScore,
                    timeTaken: res.data.timeTaken
                });
                setPhase('results');
            } else {
                // Score >= 2, round 2
                setQuestions(res.data.questions);
                setAnswers({});
                setPhase('round2');
                setTimerRunning(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Evaluation failed');
            setPhase('round1');
            setTimerRunning(true);
        }
    };

    // Submit round 2
    const submitRound2 = async () => {
        const unanswered = questions.filter(q => !answers[q.id]?.trim());
        if (unanswered.length > 0) {
            setError('Please answer all questions before submitting.');
            return;
        }

        setTimerRunning(false);
        setPhase('evaluating');
        setError(null);

        try {
            const payload = {
                skillName,
                answers: questions.map(q => ({
                    id: q.id,
                    difficulty: q.difficulty,
                    skill: q.skill,
                    question: q.question,
                    answer: answers[q.id],
                    correctAnswer: q.correctAnswer
                })),
                timeTaken: timer
            };

            const res = await api.post('/skills/test/final', payload);

            setRound2Evaluation(res.data.evaluation);
            setFinalResult({
                totalScore: res.data.totalScore,
                maxScore: res.data.maxScore,
                timeTaken: res.data.timeTaken,
                round1Score: res.data.round1Score,
                round2Score: res.data.round2Score
            });
            setPhase('results');
        } catch (err) {
            setError(err.response?.data?.message || 'Final evaluation failed');
            setPhase('round2');
            setTimerRunning(true);
        }
    };

    // -- RENDER --

    if (phase === 'loading') {
        return (
            <Layout>
                <div className="flex-center flex-col min-h-50vh gap-md">
                    <div className="loader"></div>
                    <p className="text-secondary">Generating questions for <strong>{skillName}</strong>...</p>
                </div>
            </Layout>
        );
    }

    if (phase === 'error') {
        return (
            <Layout>
                <div className="flex-center flex-col min-h-50vh gap-md">
                    <h2 className="text-error"> {error}</h2>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </Layout>
        );
    }

    if (phase === 'evaluating') {
        return (
            <Layout>
                <div className="flex-center flex-col min-h-50vh gap-md">
                    <div className="loader"></div>
                    <h3 className="text-primary">Evaluating your answers...</h3>
                    <p className="text-secondary">Our AI is reviewing your responses. Hang tight.</p>
                </div>
            </Layout>
        );
    }

    if (phase === 'results') {
        const scorePercent = ((finalResult.totalScore / finalResult.maxScore) * 100).toFixed(0);

        return (
            <Layout>
                <div className="max-w-700 mx-auto">
                    <Card className="text-center" style={{ padding: '3rem 2rem' }}>
                        <h1 className="text-2xl mb-xs" style={{ color: finalResult.totalScore >= 4 ? 'var(--success-color)' : finalResult.totalScore >= 2 ? 'var(--brand-color)' : 'var(--error-color)' }}>
                            {finalResult.totalScore >= 4 ? 'Excellent Performance' : finalResult.totalScore >= 2 ? 'Good Effort' : 'Needs Improvement'}
                        </h1>
                        <h2 className="mb-xs">Test Complete</h2>
                        <p className="text-secondary mb-xl">{skillName}</p>

                        <div className="flex justify-center mb-xl" style={{ gap: '3rem' }}>
                            <div>
                                <h3 className="text-4xl m-0" style={{
                                    color: scorePercent >= 60 ? 'var(--success-color)' : 'var(--error-color)'
                                }}>
                                    {finalResult.totalScore}/{finalResult.maxScore}
                                </h3>
                                <p className="text-sm text-tertiary">Score</p>
                            </div>
                            <div>
                                <h3 className="text-4xl text-brand m-0">
                                    {formatTime(finalResult.timeTaken)}
                                </h3>
                                <p className="text-sm text-tertiary">Time</p>
                            </div>
                        </div>

                        {finalResult.maxScore === 6 && finalResult.round1Score !== undefined && (
                            <p className="text-secondary mb-lg text-sm">
                                Round 1: {finalResult.round1Score}/4 • Round 2: {finalResult.round2Score}/2
                            </p>
                        )}

                        {/* Feedback */}
                        {(round1Evaluation || round2Evaluation) && (
                            <div className="text-left mt-lg">
                                <h4 className="mb-md text-secondary uppercase text-xs tracking-wider">
                                    Evaluation Breakdown
                                </h4>
                                {round1Evaluation && round1Evaluation.map(ev => (
                                    <div key={ev.id} style={{
                                        padding: '0.75rem 1rem',
                                        marginBottom: '0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: ev.score === 1 ? 'rgba(5, 118, 66, 0.08)' : 'rgba(204, 16, 22, 0.08)',
                                        border: `1px solid ${ev.score === 1 ? 'rgba(5, 118, 66, 0.2)' : 'rgba(204, 16, 22, 0.2)'}`
                                    }}>
                                        <span className="font-semibold">Q{ev.id}: {ev.score === 1 ? '✓' : '✗'}</span>
                                        <span className="text-secondary ml-sm text-sm">{ev.feedback}</span>
                                    </div>
                                ))}
                                {round2Evaluation && round2Evaluation.map(ev => (
                                    <div key={ev.id} style={{
                                        padding: '0.75rem 1rem',
                                        marginBottom: '0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: ev.score === 1 ? 'rgba(5, 118, 66, 0.08)' : 'rgba(204, 16, 22, 0.08)',
                                        border: `1px solid ${ev.score === 1 ? 'rgba(5, 118, 66, 0.2)' : 'rgba(204, 16, 22, 0.2)'}`
                                    }}>
                                        <span className="font-semibold">Q{ev.id}: {ev.score === 1 ? '✓' : '✗'}</span>
                                        <span className="text-secondary ml-sm text-sm">{ev.feedback}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            variant="primary"
                            onClick={() => navigate('/dashboard')}
                            className="mt-xl"
                        >
                            Back to Dashboard
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    // Round 1 or Round 2 question view
    const isRound2 = phase === 'round2';
    const currentRound = isRound2 ? 2 : 1;

    return (
        <Layout>
            <div className="max-w-800 mx-auto">
                {/* Header with timer */}
                <div className="test-header">
                    <div>
                        <h1 className="m-0 text-2xl">
                            Skill Test {isRound2 && '— Bonus Round'}
                        </h1>
                        <p className="text-secondary m-0 text-sm">
                            {skillName} • Round {currentRound}/{isRound2 ? 2 : '?'}
                        </p>
                    </div>
                    <div 
                        className="test-timer"
                        style={{
                            background: timerRunning ? 'var(--brand-color)' : 'var(--text-tertiary)',
                        }}
                    >
                        {formatTime(timer)}
                    </div>
                </div>

                {isRound2 && round1Evaluation && (
                    <Card className="mb-lg" style={{ backgroundColor: 'rgba(10, 102, 194, 0.05)' }}>
                        <p className="m-0 font-semibold text-brand">
                            Round 1 Score: {round1Score}/4 — Well done. Now attempt 2 expert-level questions.
                        </p>
                    </Card>
                )}

                {error && (
                    <Card className="mb-md" style={{ backgroundColor: 'rgba(204, 16, 22, 0.05)', border: '1px solid rgba(204, 16, 22, 0.2)' }}>
                        <p className="m-0 text-error">{error}</p>
                    </Card>
                )}

                {/* Questions */}
                {questions.map((q, idx) => (
                    <Card key={q.id} className="mb-lg">
                        <div className="flex justify-between items-center mb-md">
                            <span 
                                className="difficulty-badge"
                                style={{
                                    backgroundColor: difficultyColors[q.difficulty] || 'var(--brand-color)'
                                }}
                            >
                                {difficultyLabels[q.difficulty] || q.difficulty}
                            </span>
                            <span className="text-secondary text-sm">
                                {q.skill}
                            </span>
                        </div>

                        <p className="text-primary font-medium text-lg leading-relaxed mb-lg">
                            {q.question.split('___').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className="fill-blank">
                                            {answers[q.id] || '  ?  '}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </p>

                        <input
                            type="text"
                            placeholder="Fill in the blank..."
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            autoComplete="off"
                            className="test-input"
                        />
                    </Card>
                ))}

                {/* Submit */}
                <div className="flex justify-end gap-md mb-2xl">
                    <Button
                        variant="ghost"
                        onClick={() => setIsConfirmOpen(true)}
                    >
                        Quit Test
                    </Button>
                    <Button
                        variant="primary"
                        size="large"
                        onClick={isRound2 ? submitRound2 : submitRound1}
                    >
                        {isRound2 ? 'Submit Final Answers' : 'Submit Round 1'}
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Quit Test"
                message="Are you sure you want to quit? Your progress in this test session will be lost."
                confirmText="Quit"
                variant="danger"
                onConfirm={() => navigate('/dashboard')}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </Layout>
    );
};

export default SkillTest;
