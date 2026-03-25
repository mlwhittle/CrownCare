import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Send, Trash2, Calendar, Clock, Edit3, Mic, MicOff, Volume2 } from 'lucide-react';
import { generateEmpatheticResponse, loadApiKey } from '../services/GeminiService';
import journalImg from '../assets/images/journal.png';

export default function Journal() {
    const { journalLogs, addJournalEntry, deleteJournalEntry, stylistCode, isStylistAccount } = useApp();
    const [entry, setEntry] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeakingResult, setIsSpeakingResult] = useState(false);

    const availableTags = ['High Stress 🌪️', 'Heavy Menstruation 🩸', 'Medication Change 💊', 'Telogen Effluvium 📉', 'Hormonal Shift 🌙', 'Tender Scalp 🌵', 'High Heat / Iron ♨️'];
    const toggleTag = (tag) => {
        const isSelecting = !selectedTags.includes(tag);
        
        // Intercept clinical trigger selection for unlinked users to drive B2B adoption
        if (isSelecting && !isStylistAccount && !stylistCode) {
            alert("To share this clinical data for specific treatment and advice, please connect your Stylist!\n\nTell them to visit Crowncare.net/professionals to download the B2B portal and give you their referral code.");
        }
        
        setSelectedTags(prev => isSelecting ? [...prev, tag] : prev.filter(t => t !== tag));
    };

    const handleListen = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Voice Dictation. Please use Safari or Chrome.");
            return;
        }
        
        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) setEntry(prev => prev + (prev ? ' ' : '') + event.results[i][0].transcript);
            }
        };
        recognition.onerror = (e) => {
            console.error(e);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!entry.trim() && selectedTags.length === 0) return;
        
        // 🔒 MOBILE BROWSER HACK: We MUST trigger the speech synthesis engine synchronously
        // inside the initial user click event, otherwise iOS/Android will silently block it after the 'await'.
        window.speechSynthesis.cancel();
        const unlockUtterance = new SpeechSynthesisUtterance('');
        unlockUtterance.volume = 0;
        window.speechSynthesis.speak(unlockUtterance);
        
        let finalEntry = entry.trim();
        if (!finalEntry && selectedTags.length > 0) {
            finalEntry = 'Logged clinical trigger tags.';
        }
        
        addJournalEntry(finalEntry, selectedTags);
        
        // AI Therapy Companion Layer
        if (finalEntry.length > 15) {
            const apiKey = loadApiKey();
            if (apiKey) {
               setIsSpeakingResult('generating');
               try {
                   const aiResponse = await generateEmpatheticResponse(apiKey, finalEntry);
                   
                   setIsSpeakingResult('speaking');
                   
                   // Clean text of any accidental markdown
                   const cleanText = aiResponse.replace(/[*_#]/g, '');
                   const utterance = new SpeechSynthesisUtterance(cleanText);
                   
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
                   
                   utterance.onend = () => setIsSpeakingResult(false);
                   utterance.onerror = (e) => {
                       console.error("Speech Synthesis Error:", e);
                       setIsSpeakingResult(false);
                   };
                   
                   // Strict 10-second failsafe to unlock the UI
                   setTimeout(() => setIsSpeakingResult(false), 10000);
                   
                   window.speechSynthesis.speak(utterance);
               } catch (error) {
                   console.error("AI Therapy Error:", error);
                   setIsSpeakingResult(false);
               }
            }
        }
        
        setEntry('');
        setSelectedTags([]);
    };

    const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <div className="page-container fade-in">
            <img src={journalImg} alt="Voice Journal" className="page-header-img" style={{ marginTop: '1rem' }} />
            <div className="page-header" style={{ marginBottom: 'var(--space-md)' }}>
                <h2>My Journal</h2>
                <p className="text-muted text-sm" style={{ marginTop: 'var(--space-xs)' }}>
                    Your private space to document the emotional and qualitative moments of your hair growth journey.
                </p>
            </div>

            <div className="card mb-lg" style={{ background: 'var(--bg-secondary)', borderTop: '4px solid var(--brand-300)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Edit3 size={20} color="var(--brand-400)" />
                    New Entry
                </h3>
                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Clinical Triggers (Optional)</label>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px', lineHeight: 1.4 }}>
                            Select the options below to log them into your history record so your connected stylist knows exactly what you're experiencing.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {availableTags.map(tag => (
                                <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{ 
                                    padding: '6px 14px', borderRadius: '20px', fontSize: 'var(--font-size-xs)', fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                                    background: selectedTags.includes(tag) ? 'var(--error)' : 'var(--bg-primary)',
                                    color: selectedTags.includes(tag) ? 'white' : 'var(--text-primary)',
                                    borderColor: selectedTags.includes(tag) ? 'var(--error)' : 'var(--border-color)'
                                }}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                        <textarea
                            className="form-input"
                            placeholder="Type or tap the microphone to vent. The AI Therapy Companion will respond to guide you through stress triggers... 🎙️"
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            rows={5}
                            style={{ resize: 'vertical', paddingRight: '46px', borderColor: isListening ? 'var(--blue-400)' : 'var(--border-color)', boxShadow: isListening ? '0 0 12px rgba(96, 165, 250, 0.2)' : 'none', transition: 'all 0.3s' }}
                        />
                        <button 
                            type="button" 
                            onClick={handleListen}
                            style={{ position: 'absolute', bottom: '16px', right: '12px', background: isListening ? 'var(--blue-500)' : 'var(--surface-color)', color: isListening ? 'white' : 'var(--text-tertiary)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: isListening ? '0 4px 12px rgba(96, 165, 250, 0.4)' : 'none', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
                        >
                            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>
                    </div>

                    {isSpeakingResult && (
                        <div style={{ padding: '12px', background: 'linear-gradient(to right, rgba(96, 165, 250, 0.1), rgba(167, 139, 250, 0.1))', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'var(--blue-500)', color: 'white', padding: '8px', borderRadius: '50%', animation: 'pulse 1s infinite' }}>
                                <Volume2 size={18} />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                {isSpeakingResult === 'generating' ? 'AI Companion is thinking...' : 'Your AI Companion is speaking...'}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={(!entry.trim() && selectedTags.length === 0) || isSpeakingResult}>
                        <Send size={16} /> Save Journal Entry
                    </button>
                </form>
            </div>

            <div className="journal-history">
                <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <BookOpen size={20} color="var(--text-tertiary)" />
                    Journal History <span className="text-muted text-sm" style={{ fontWeight: 400 }}>({journalLogs.length})</span>
                </h3>

                {journalLogs.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
                        <BookOpen size={40} style={{ opacity: 0.3, margin: '0 auto var(--space-sm)', color: 'var(--brand-300)' }} />
                        <p className="text-muted">No journal entries yet. Start writing securely above.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {journalLogs.map((log) => (
                            <div key={log.id} className="card" style={{ padding: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {fmtShort(log.date)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {fmtTime(log.date)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { if (confirm('Delete this entry?')) deleteJournalEntry(log.id) }}
                                        style={{ background: 'none', border: 'none', color: 'var(--error)', opacity: 0.5, cursor: 'pointer' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                                    {log.text}
                                </p>
                                {log.tags && log.tags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                                        {log.tags.map(tag => (
                                            <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', fontWeight: 600 }}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ height: '100px' }} /> {/* Bottom nav spacing */}
        </div>
    );
}
