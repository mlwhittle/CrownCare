import { useState, useRef, useEffect } from 'react';
import { askGemini, loadApiKey, saveApiKey, loadSavedAnswers, persistSavedAnswers } from '../services/GeminiService';
import { Sparkles, Send, X, Save, Trash2, MessageCircle, Key } from 'lucide-react';
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
    const [apiKey, setApiKey] = useState(loadApiKey);
    const [showSetup, setShowSetup] = useState(!loadApiKey());
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState([]);
    const [savedAnswers, setSavedAnswers] = useState(loadSavedAnswers);
    const [showSaved, setShowSaved] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, loading]);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            saveApiKey(apiKey.trim());
            setShowSetup(false);
        }
    };

    const handleAsk = async (e) => {
        e?.preventDefault();
        if (!question.trim() || !apiKey) return;
        const q = question.trim();
        setQuestion('');
        setChat(prev => [...prev, { role: 'user', text: q }]);
        setLoading(true);
        try {
            const response = await askGemini(q, apiKey);
            setChat(prev => [...prev, { role: 'ai', text: response, timestamp: new Date().toISOString() }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'error', text: err.message || 'Failed to get response' }]);
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

    const content = (
        <div className={`ai-coach ${isOverlay ? 'overlay-mode' : 'page-mode'}`}>
            {/* Header */}
            <div className="ai-coach-header">
                <div className="ai-coach-title">
                    <Sparkles size={20} />
                    <span>AI Hair Coach</span>
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

            {/* API key setup */}
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
                <PremiumGate featureName="AI Coach">
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
                            <div key={i} className={`chat-msg ${msg.role}`}>
                                {msg.role === 'user' && (
                                    <div className="msg-label"><MessageCircle size={12} /> You</div>
                                )}
                                {msg.role === 'ai' && (
                                    <div className="msg-label">
                                        <Sparkles size={12} /> AI Coach
                                        <button
                                            className="save-btn"
                                            onClick={() => {
                                                const prevQ = chat.slice(0, i).reverse().find(m => m.role === 'user');
                                                handleSaveAnswer(msg.text, prevQ?.text || '');
                                            }}
                                        >
                                            <Save size={12} /> Save
                                        </button>
                                    </div>
                                )}
                                {msg.role === 'error' && <div className="msg-label" style={{ color: 'var(--error)' }}>⚠️ Error</div>}
                                <div className="msg-body">{msg.text}</div>
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

                    <form id="ai-form" className="ai-input-bar" onSubmit={handleAsk}>
                        <input
                            className="ai-input"
                            type="text"
                            placeholder="Ask about hair growth, treatments, scalp health..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="ai-send" disabled={loading || !question.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
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
