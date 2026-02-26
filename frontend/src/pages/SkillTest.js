import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import api from '../lib/api';

const difficultyColors = {
    easy: '#057642',
    medium: '#eab308',
    hard: '#dc2626',
    hell: '#7c3aed',
    expert: '#be185d'
};

const difficultyLabels = {
    easy: '🟢 Easy',
    medium: '🟡 Medium',
    hard: '🔴 Hard',
    hell: '💀 Hell',
    expert: '🧠 Expert'
};

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const SkillTest = () => {
    const { repoId } = useParams();
    const navigate = useNavigate();

    // State machine: 'loading' | 'round1' | 'evaluating' | 'round2' | 'results'
    const [phase, setPhase] = useState('loading');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [repoTitle, setRepoTitle] = useState('');
    const [round1Score, setRound1Score] = useState(null);
    const [round1Evaluation, setRound1Evaluation] = useState(null);
    const [round2Evaluation, setRound2Evaluation] = useState(null);
    const [finalResult, setFinalResult] = useState(null);
    const [error, setError] = useState(null);

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
            const res = await api.post(`/repositories/${repoId}/test/start`);
            setQuestions(res.data.questions);
            setRepoTitle(res.data.repoTitle);
            setAnswers({});
            setPhase('round1');
            setTimerRunning(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start test');
            setPhase('error');
        }
    }, [repoId]);

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

            const res = await api.post(`/repositories/${repoId}/test/evaluate`, payload);

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
                answers: questions.map(q => ({
                    id: q.id,
                    difficulty: q.difficulty,
                    skill: q.skill,
                    question: q.question,
                    answer: answers[q.id],
                    correctAnswer: q.correctAnswer
                })),
                timeTaken: timer,
                round1Score
            };

            const res = await api.post(`/repositories/${repoId}/test/final`, payload);

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
                <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                    <div className="loader"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Generating questions from your skills...</p>
                </div>
            </Layout>
        );
    }

    if (phase === 'error') {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ color: 'var(--error-color)' }}>⚠️ {error}</h2>
                    <Button variant="secondary" onClick={() => navigate('/my-projects')}>
                        Back to My Projects
                    </Button>
                </div>
            </Layout>
        );
    }

    if (phase === 'evaluating') {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                    <div className="loader"></div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Evaluating your answers...</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Our AI is reviewing your responses. Hang tight.</p>
                </div>
            </Layout>
        );
    }

    if (phase === 'results') {
        const passed = finalResult.maxScore === 6;
        const scorePercent = ((finalResult.totalScore / finalResult.maxScore) * 100).toFixed(0);

        return (
            <Layout>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                            {finalResult.totalScore >= 4 ? '🎉' : finalResult.totalScore >= 2 ? '👏' : '😬'}
                        </h1>
                        <h2 style={{ marginBottom: '0.5rem' }}>Test Complete</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{repoTitle}</p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '3rem',
                            marginBottom: '2rem'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '2.5rem',
                                    color: scorePercent >= 60 ? 'var(--success-color)' : 'var(--error-color)',
                                    margin: 0
                                }}>
                                    {finalResult.totalScore}/{finalResult.maxScore}
                                </h3>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Score</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2.5rem', color: 'var(--brand-color)', margin: 0 }}>
                                    {formatTime(finalResult.timeTaken)}
                                </h3>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Time</p>
                            </div>
                        </div>

                        {passed && finalResult.round1Score !== undefined && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Round 1: {finalResult.round1Score}/4 • Round 2: {finalResult.round2Score}/2
                            </p>
                        )}

                        {/* Feedback */}
                        {(round1Evaluation || round2Evaluation) && (
                            <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
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
                                        <span style={{ fontWeight: '600' }}>Q{ev.id}: {ev.score === 1 ? '✅' : '❌'}</span>
                                        <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>{ev.feedback}</span>
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
                                        <span style={{ fontWeight: '600' }}>Q{ev.id}: {ev.score === 1 ? '✅' : '❌'}</span>
                                        <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>{ev.feedback}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            variant="primary"
                            onClick={() => navigate('/my-projects')}
                            style={{ marginTop: '2rem' }}
                        >
                            Back to My Projects
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
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header with timer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--bg-primary)',
                    padding: '1rem 0',
                    zIndex: 10,
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                            Skill Test {isRound2 && '— Bonus Round'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                            {repoTitle} • Round {currentRound}/{isRound2 ? 2 : '?'}
                        </p>
                    </div>
                    <div style={{
                        background: timerRunning ? 'var(--brand-color)' : 'var(--text-tertiary)',
                        color: '#fff',
                        padding: '8px 20px',
                        borderRadius: '50px',
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'background 0.3s ease'
                    }}>
                        ⏱ {formatTime(timer)}
                    </div>
                </div>

                {isRound2 && round1Evaluation && (
                    <Card style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(10, 102, 194, 0.05)' }}>
                        <p style={{ margin: 0, fontWeight: '600', color: 'var(--brand-color)' }}>
                            🎯 Round 1 Score: {round1Score}/4 — Nice! Now tackle 2 expert-level questions.
                        </p>
                    </Card>
                )}

                {error && (
                    <Card style={{ marginBottom: '1rem', backgroundColor: 'rgba(204, 16, 22, 0.05)', border: '1px solid rgba(204, 16, 22, 0.2)' }}>
                        <p style={{ margin: 0, color: 'var(--error-color)' }}>{error}</p>
                    </Card>
                )}

                {/* Questions */}
                {questions.map((q, idx) => (
                    <Card key={q.id} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: '#fff',
                                backgroundColor: difficultyColors[q.difficulty] || 'var(--brand-color)'
                            }}>
                                {difficultyLabels[q.difficulty] || q.difficulty}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                {q.skill}
                            </span>
                        </div>

                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                            {q.question.split('___').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span style={{
                                            display: 'inline-block',
                                            minWidth: '120px',
                                            borderBottom: '2px solid var(--brand-color)',
                                            margin: '0 4px',
                                            textAlign: 'center',
                                            color: 'var(--brand-color)',
                                            fontWeight: '700'
                                        }}>
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
                            style={{
                                width: '100%',
                                padding: '0.7rem 1rem',
                                border: '2px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 102, 194, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </Card>
                ))}

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '3rem' }}>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                                navigate('/my-projects');
                            }
                        }}
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
        </Layout>
    );
};

export default SkillTest;
