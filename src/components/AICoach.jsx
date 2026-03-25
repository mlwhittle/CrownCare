import { useState, useRef, useEffect } from 'react';
import { askGemini, loadApiKey, saveApiKey, loadSavedAnswers, persistSavedAnswers } from '../services/GeminiService';
import { sendEscalationEmail } from '../services/EmailService';
import { Sparkles, Send, X, Save, Trash2, MessageCircle, Key, ShieldCheck, Headset, Paperclip, Mic, User, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PremiumGate from './PremiumGate';
import './AICoach.css';

const QUICK_QUESTIONS = [
    'What are the 4 phases of hair growth?',
    'Is rosemary oil really effective for hair regrowth?',
    'What myths about hair loss should I stop believing?',
    'How does the scalp microbiome affect hair growth?',
    'How should I use Chebe powder safely?',
    'What foods naturally block DHT?',
    'Can excessive Biotin affect my lab tests?',
    'What is the Greenhouse Effect for hair?',
];

export default function AICoach({ isOverlay, onClose }) {
    const { onboarding, getDaysTracking, getStreak, photos, treatments, nutritionLogs, customEvaluationPrompt, setCustomEvaluationPrompt } = useApp();
    const name = onboarding?.name || 'User';
    
    const [apiKey, setApiKey] = useState(loadApiKey);
    const [showSetup, setShowSetup] = useState(!loadApiKey());
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState([]);
    const [savedAnswers, setSavedAnswers] = useState(loadSavedAnswers);
    const [showSaved, setShowSaved] = useState(false);
    const [frustrationCount, setFrustrationCount] = useState(0);
    const [speakingIdx, setSpeakingIdx] = useState(null);

    // AI Transparency Consent State
    const [hasConsent, setHasConsent] = useState(() => localStorage.getItem('crowncare_ai_consent') === 'true');

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, loading]);

    // Clean up TTS when modal closes
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSpeak = (text, idx) => {
        if (!('speechSynthesis' in window)) {
            alert("Audio playback is not supported in your current browser.");
            return;
        }
        
        // If clicking the same one that is currently playing, stop it
        if (speakingIdx === idx && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setSpeakingIdx(null);
            return;
        }
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // --- HUMAN-SOUNDING NEURAL VOICE ASSIGNMENT ---
        try {
            const voices = window.speechSynthesis.getVoices();
            const premiumVoice = voices.find(v => v?.name?.includes('Google US English')) || 
                                 voices.find(v => v?.name?.includes('Samantha') || v?.name?.includes('Siri')) || 
                                 voices.find(v => v?.name?.includes('Aria') || v?.name?.includes('Jenny') || v?.name?.includes('Zira')) || 
                                 voices.find(v => v?.lang === 'en-US' && v?.name?.includes('Female')) ||
                                 voices.find(v => v?.lang?.startsWith('en-US'));
                                 
            if (premiumVoice) utterance.voice = premiumVoice;
            utterance.pitch = 1.05; 
            utterance.rate = 0.98;
        } catch (e) {
            console.error("Voice assignment error bypassed:", e);
        }
        
        utterance.onend = () => setSpeakingIdx(null);
        utterance.onerror = () => setSpeakingIdx(null);
        
        window.speechSynthesis.speak(utterance);
        setSpeakingIdx(idx);
    };

    // Check for incoming custom evaluations from the TreatmentTracker
    useEffect(() => {
        if (customEvaluationPrompt && apiKey && hasConsent) {
            handleAsk(null, customEvaluationPrompt);
            setCustomEvaluationPrompt(''); // Clear to prevent loops
        }
    }, [customEvaluationPrompt, apiKey, hasConsent]);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            saveApiKey(apiKey.trim());
            setShowSetup(false);
        }
    };

    const handleAsk = async (e, overrideQuestion = null) => {
        e?.preventDefault();
        const q = (overrideQuestion || question).trim();
        if (!q || !apiKey) return;
        
        setQuestion('');
        setChat(prev => [...prev, { role: 'user', text: q }]);
        const lowerQ = q.toLowerCase();
        
        // --- 1. SAFETY VALVE & FRUSTRATION CHECK ---
        const escalationKeywords = ['talk to human', 'real person', 'customer support', 'manager', 'speak to someone', 'customer service'];
        const isFrustrated = frustrationCount >= 2;
        const requestedHuman = escalationKeywords.some(kw => lowerQ.includes(kw));

        if (isFrustrated || requestedHuman) {
             setChat(prev => [...prev, { 
                role: 'ai', 
                text: "I’ve alerted my lead engineer, Melvin. He’ll look into this personally and get back to you soon.",
                timestamp: new Date().toISOString(),
                isEscalation: true
             }]);
             
             // Dispatch the background email to the founder
             const reason = requestedHuman ? 'User Requested Human' : 'AI Processing Timeout/Error';
             sendEscalationEmail(name, reason, q, chat);
             
             // Reset frustration so they aren't stuck in a loop
             setFrustrationCount(0);
             return;
        }

        // --- 2. TIER 2 INTENT ROUTING (Business / Billing) ---
        const billingRegex = /\b(billing|password|cancel|credit card|charge|subscription|refund|account)\b/;
        if (billingRegex.test(lowerQ)) {
             setChat(prev => [...prev, { 
                role: 'ai', 
                text: "To resolve issue regarding your account, password, or billing, please visit your secure portal: [Stripe Customer Portal](https://billing.stripe.com/p/login/test_portal). If you need a password reset, say 'reset password' and I will trigger a Firebase email.", 
                timestamp: new Date().toISOString() 
             }]);
             return;
        }

        // --- 3. TIER 1 CLINICAL ROUTING (Gemini AI with Context) ---
        setLoading(true);
        try {
            const userData = {
               days: getDaysTracking(),
               streak: getStreak(),
               photos: photos.length,
               recentTreatments: treatments.slice(0, 3).map(t => t.name).join(', '),
               recentNutrition: nutritionLogs.length > 0
            };

            const response = await askGemini(q, apiKey, userData);
            setChat(prev => [...prev, { role: 'ai', text: response, timestamp: new Date().toISOString() }]);
        } catch (err) {
            setFrustrationCount(prev => prev + 1);
            setChat(prev => [...prev, { role: 'error', text: err.message || 'Failed to get response. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const quickAsk = (q) => {
        setQuestion(q);
        setTimeout(() => {
            const form = document.getElementById('ai-form');
            if (form) form.requestSubmit();
        }, 100);
    };

    const handleSaveAnswer = (text, questionText) => {
        const entry = { id: Date.now().toString(), question: questionText, answer: text, date: new Date().toISOString() };
        const updated = [entry, ...savedAnswers].slice(0, 3);
        setSavedAnswers(updated);
        persistSavedAnswers(updated);
    };

    const deleteSaved = (id) => {
        const updated = savedAnswers.filter(s => s.id !== id);
        setSavedAnswers(updated);
        persistSavedAnswers(updated);
    };

    const handleAcceptConsent = () => {
        localStorage.setItem('crowncare_ai_consent', 'true');
        setHasConsent(true);
    };

    const content = (
        <div className={`ai-coach ${isOverlay ? 'overlay-mode' : 'page-mode'}`}>
            {/* Header */}
            <div className="ai-coach-header">
                <div className="ai-coach-title">
                    <Headset size={20} />
                    <span>CrownCare Concierge</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {savedAnswers.length > 0 && (
                        <button className="ai-header-btn" onClick={() => setShowSaved(!showSaved)}>
                            <Save size={16} /> {savedAnswers.length}
                        </button>
                    )}
                    <button className="ai-header-btn" onClick={() => setShowSetup(true)}>
                        <Key size={14} />
                    </button>
                    {isOverlay && onClose && (
                        <button className="ai-header-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* AI Transparency / Consent Gate */}
            {!hasConsent ? (
                <div className="consent-modal">
                    <div className="consent-icon-wrap">
                        <ShieldCheck size={40} className="consent-icon" />
                    </div>
                    <h3 className="consent-title">Privacy & AI Disclosure</h3>
                    <div className="consent-body">
                        <p>
                            To provide you with a highly personalized experience, the CrownCare Hair Coach processes your inputs, questions, and daily logs using <strong>Google's Clinical AI models (Gemini)</strong>.
                        </p>
                        <p>
                            By proceeding, you acknowledge and consent to this data processing as outlined by the 2026 Privacy Acts for health and biometric applications.
                        </p>
                    </div>
                    <button className="btn btn-primary consent-btn" onClick={handleAcceptConsent}>
                        I Understand & Agree
                    </button>
                    <p className="consent-footer">Your privacy and data security are our absolute priority.</p>
                </div>
            ) : (
                /* Main App Logic (only renders after consent) */
                <PremiumGate featureName="AI Coach">
                    {showSetup ? (
                        <div className="ai-setup">
                            <Sparkles size={36} style={{ color: 'var(--sky-500)', marginBottom: 'var(--space-md)' }} />
                            <h3>Connect Gemini AI</h3>
                            <p>Enter your Google Gemini API key to enable the AI Hair Coach.</p>
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Get a free key →
                            </a>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Paste API key..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{ marginTop: 'var(--space-md)' }}
                            />
                            <button className="btn btn-primary" onClick={handleSaveKey} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                                Save & Connect
                            </button>
                        </div>
                    ) : showSaved ? (
                        /* Saved answers */
                        <div className="ai-saved">
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Saved Answers ({savedAnswers.length}/3)</h3>
                            {savedAnswers.map(sa => (
                                <div key={sa.id} className="saved-card">
                                    <div className="saved-q">Q: {sa.question}</div>
                                    <div className="saved-a">{sa.answer}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-sm)' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                            {new Date(sa.date).toLocaleDateString()}
                                        </span>
                                        <button onClick={() => deleteSaved(sa.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowSaved(false)} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                                Back to Chat
                            </button>
                        </div>
                    ) : (
                        /* Chat */
                        <>
                            <div className="ai-messages">
                                {chat.length === 0 && (
                                    <div className="ai-welcome">
                                        <Sparkles size={36} style={{ color: 'var(--sky-400)' }} />
                                        <h3>Ask me anything about hair</h3>
                                        <p>I'm trained as a trichologist — covering hair science, treatments, nutrition, scalp health, and more.</p>
                                        <div className="quick-chips">
                                            {QUICK_QUESTIONS.map((q, i) => (
                                                <button key={i} className="quick-chip" onClick={() => quickAsk(q)}>
                                                    {q.length > 40 ? q.slice(0, 38) + '…' : q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {chat.map((msg, i) => (
                                    <div key={i} className={`chat-msg ${msg.role}`} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', marginBottom: '1rem', maxWidth: '100%' }}>
                                        {/* Avatar */}
                                        <div style={{ 
                                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                            background: msg.role === 'user' ? 'var(--brand-primary)' : 'linear-gradient(135deg, #FCD34D, #B45309)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                        }}>
                                            {msg.role === 'user' ? <User size={18} color="white" /> : <Sparkles size={18} color="#050508" />}
                                        </div>

                                        {/* Bubble */}
                                        <div style={{
                                            background: msg.role === 'user' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                                            border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                                            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0, 31, 63, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                                            color: msg.role === 'error' ? 'var(--error)' : (msg.role === 'user' ? 'white' : 'var(--text-primary)'),
                                            padding: '12px 16px',
                                            borderRadius: '16px',
                                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                            borderBottomLeftRadius: msg.role === 'ai' || msg.role === 'error' ? '4px' : '16px',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5',
                                            maxWidth: '75%',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {msg.text}
                                            {msg.role === 'ai' && (
                                                <button 
                                                    onClick={() => handleSpeak(msg.text, i)}
                                                    style={{ 
                                                        marginTop: '8px', 
                                                        background: 'transparent', 
                                                        border: 'none', 
                                                        color: speakingIdx === i ? 'var(--gold-600)' : 'var(--text-tertiary)', 
                                                        cursor: 'pointer',
                                                        padding: '4px 0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {speakingIdx === i ? (
                                                        <><VolumeX size={14} /> Stop Audio</>
                                                    ) : (
                                                        <><Volume2 size={14} /> Read Aloud</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="chat-msg ai">
                                        <div className="msg-label"><Sparkles size={12} /> AI Coach</div>
                                        <div className="typing"><span /><span /><span /></div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form id="ai-form" onSubmit={handleAsk} style={{ background: 'transparent', padding: '1rem', borderTop: 'none', marginTop: 'auto' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '50px',
                                    padding: '0.4rem 0.6rem',
                                    width: '100%',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                                }}>
                                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: '0 0.5rem', cursor: 'pointer' }}>
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        style={{ 
                                            flex: 1, 
                                            background: 'transparent', 
                                            border: 'none', 
                                            color: 'var(--text-primary)', 
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            padding: '0 0.5rem'
                                        }}
                                        type="text"
                                        placeholder="Message..."
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button type="submit" style={{ 
                                        background: 'linear-gradient(135deg, #FCD34D 0%, #B45309 100%)', 
                                        border: 'none', 
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: '#050508',
                                        cursor: (loading || !question.trim()) ? 'not-allowed' : 'pointer',
                                        opacity: (loading || !question.trim()) ? 0.5 : 1,
                                        marginLeft: '0.25rem'
                                    }} disabled={loading || !question.trim()}>
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </PremiumGate>
            )}
        </div>
    );

    if (isOverlay) {
        return (
            <div className="ai-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
                <div className="ai-panel">{content}</div>
            </div>
        );
    }

    return content;
}
