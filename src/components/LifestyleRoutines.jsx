import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sparkles, Timer, CheckCircle2, Circle, Play, Pause, RotateCcw } from 'lucide-react';
import routineImg from '../assets/images/routine.png';
import './LifestyleRoutines.css';

const NIGHTLY_STEPS = [
    { id: 'dry', label: 'Hair is completely dry', desc: 'Wet hair snaps easily — never sleep with damp hair' },
    { id: 'detangle', label: 'Hair is detangled', desc: 'Reduces friction and prevents breakage overnight' },
    { id: 'loose', label: 'Styled loosely', desc: 'Avoid tight ponytails or braids that cause traction' },
    { id: 'silk', label: 'Silk/satin pillowcase or bonnet', desc: 'Retains moisture and reduces friction vs cotton' },
];

const GHE_STEPS = [
    { num: 1, title: 'Lightly mist hair with water', desc: 'Use a spray bottle — hair should be damp, not soaked' },
    { num: 2, title: 'Apply a light oil', desc: 'Coconut, olive, or jojoba oil on scalp and hair shaft' },
    { num: 3, title: 'Put on a plastic shower cap', desc: 'This traps body heat and creates a warm, moist environment' },
    { num: 4, title: 'Wear overnight', desc: 'In the morning, remove cap and style as usual' },
];

export default function LifestyleRoutines() {
    const { logRoutine, getTodayRoutines } = useApp();
    const [tab, setTab] = useState('nightly');
    const todayRoutines = getTodayRoutines();

    const [nightChecks, setNightChecks] = useState(() => {
        const nr = todayRoutines.find(r => r.type === 'nightly');
        return nr?.checks || {};
    });

    const toggleNight = (id) => {
        const updated = { ...nightChecks, [id]: !nightChecks[id] };
        setNightChecks(updated);
        logRoutine({ type: 'nightly', checks: updated });
    };

    // Inversion timer (5 minutes = 300 seconds)
    const [seconds, setSeconds] = useState(300);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running && seconds > 0) {
            intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000);
        } else {
            clearInterval(intervalRef.current);
            if (seconds === 0 && running) {
                setRunning(false);
                logRoutine({ type: 'inversion', completed: true });
            }
        }
        return () => clearInterval(intervalRef.current);
    }, [running, seconds]);

    const resetTimer = () => { setSeconds(300); setRunning(false); };
    const mmss = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    const progress = ((300 - seconds) / 300) * 100;

    return (
        <div className="lifestyle">
            <img src={routineImg} alt="Calming Hair Routine" className="page-header-img" />
            <h2 className="gradient-text">Lifestyle & Routines</h2>

            <div className="home-intro-text" style={{ marginTop: 'var(--space-md)' }}>
                <p>
                    Healthy hair growth isn’t just about products—it’s about daily habits like gentle styling, protecting your hair while you sleep, managing stress, and avoiding excessive heat or tight hairstyles that strain the roots. When your routines protect the scalp and reduce breakage, you give your hair the best chance to grow longer, stronger, and healthier over time.
                </p>
            </div>

            <p className="text-muted text-sm mb-lg">Protective habits that maximize your hair growth journey.</p>

            <div className="lt-tabs">
                <button className={`lt ${tab === 'nightly' ? 'active' : ''}`} onClick={() => setTab('nightly')}><Moon size={16} /> Nightly</button>
                <button className={`lt ${tab === 'ghe' ? 'active' : ''}`} onClick={() => setTab('ghe')}><Sparkles size={16} /> GHE</button>
                <button className={`lt ${tab === 'inversion' ? 'active' : ''}`} onClick={() => setTab('inversion')}><Timer size={16} /> Inversion</button>
            </div>

            {/* Nightly routine */}
            {tab === 'nightly' && (
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                        <Moon size={20} /> Pre-Bedtime Hair Routine
                    </h3>
                    <div className="night-list">
                        {NIGHTLY_STEPS.map(step => (
                            <label key={step.id} className="night-item" onClick={() => toggleNight(step.id)}>
                                <div className={`n-check ${nightChecks[step.id] ? 'done' : ''}`}>
                                    {nightChecks[step.id] ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                </div>
                                <div>
                                    <strong>{step.label}</strong>
                                    <p>{step.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="night-progress">
                        {Object.values(nightChecks).filter(Boolean).length}/{NIGHTLY_STEPS.length} completed tonight
                    </div>
                </div>
            )}

            {/* GHE Guide */}
            {tab === 'ghe' && (
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                        <Sparkles size={20} /> The Greenhouse Effect (GHE)
                    </h3>
                    <p className="text-muted text-sm mb-lg">
                        An overnight method that traps body heat to stimulate the scalp and promote deep moisture penetration.
                    </p>
                    <div className="ghe-steps">
                        {GHE_STEPS.map(step => (
                            <div key={step.num} className="ghe-step">
                                <div className="ghe-num">{step.num}</div>
                                <div>
                                    <strong>{step.title}</strong>
                                    <p className="text-xs text-muted">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn btn-primary mt-lg"
                        style={{ width: '100%' }}
                        onClick={() => logRoutine({ type: 'ghe', completed: true })}
                    >
                        ✅ Mark GHE Done for Tonight
                    </button>
                </div>
            )}

            {/* Inversion Timer */}
            {tab === 'inversion' && (
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                        <Timer size={20} /> Inversion Method
                    </h3>
                    <p className="text-muted text-sm mb-lg">
                        Hang your head upside down for 5 minutes and massage your scalp with your fingertips (not brushes) to maximize blood flow to the follicles.
                    </p>
                    <div className="timer-circle">
                        <svg viewBox="0 0 120 120" className="timer-svg">
                            <circle cx="60" cy="60" r="54" className="timer-bg" />
                            <circle
                                cx="60" cy="60" r="54"
                                className="timer-progress"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 54}`,
                                    strokeDashoffset: `${2 * Math.PI * 54 * (1 - progress / 100)}`,
                                }}
                            />
                        </svg>
                        <div className="timer-display">{mmss}</div>
                    </div>
                    <div className="timer-controls">
                        <button className="btn btn-secondary" onClick={resetTimer}><RotateCcw size={16} /></button>
                        <button
                            className={`btn ${running ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                            onClick={() => setRunning(!running)}
                            style={{ flex: 1 }}
                        >
                            {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> {seconds === 300 ? 'Start' : 'Resume'}</>}
                        </button>
                    </div>
                    <div className="timer-tips">
                        <h4>Tips for best results:</h4>
                        <ul>
                            <li>Use your <strong>fingertips</strong> — never a brush or comb</li>
                            <li>Apply light pressure in circular motions</li>
                            <li>Focus on areas of thinning</li>
                            <li>Do for <strong>7 consecutive days</strong>, then take a 3-week break</li>
                            <li>Stop immediately if you feel dizzy</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
