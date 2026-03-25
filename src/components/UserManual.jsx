import { X, BookOpen, Camera, ShieldCheck, BarChart2, Zap } from 'lucide-react';
import './Settings.css'; // Reuse Settings CSS for styling

export default function UserManual({ onClose }) {
    return (
        <div className="settings" style={{ paddingBottom: '100px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2 className="gradient-text" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={24} /> User Manual
                </h2>
                <button className="btn btn-outline" style={{ padding: '8px', border: 'none' }} onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                Welcome to CrownCare! Whether you are a solo user looking to reverse hair damage, or a Master Stylist looking to elevate your business into a clinical practice, CrownCare provides the advanced tools you need to succeed.
            </p>

            {/* PART 1 */}
            <div className="card mb-lg">
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: 'var(--space-md)' }}>
                    Part 1: The Solo User
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>
                    CrownCare is not just a tracker; it is a permanent, clinical archive of everything that happens to your scalp from the day you download it.
                </p>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-500)', marginBottom: '8px' }}>
                        <Camera size={18} /> 1. The Visual Hair Diary & Ghost Camera
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Stop guessing if your hair is growing. When taking your weekly progress photo, the app activates the <strong>Ghost Camera</strong>. It overlays your translucent photo from last week directly on your viewfinder so you perfectly match the angle and lighting every time.
                    </p>
                    <p style={{ fontSize: 'var(--font-size-responsive)', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        &bull; <strong>The Scalp Diagnostic:</strong> Immediately after the photo, rate your scalp's oil, hydration, and flakes to track its biological status.
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '8px' }}>
                        <ShieldCheck size={18} /> 2. The Treatment Tracker
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Blindly applying generic chemicals causes breakage. Go to the Custom Tab, tap the Camera Icon, and snap a photo of any product ingredient list. The AI will instantly analyze the chemicals against your porosity and warn you of heavy silicones.
                    </p>
                </div>
            </div>

            {/* PART 2 */}
            <div className="card mb-lg">
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: 'var(--space-md)' }}>
                    Part 2: The Arsenal of AI Reports
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    By using the Diary and Tracker, CrownCare generates a suite of highly advanced reports at your disposal:
                </p>
                <ul style={{ paddingLeft: '20px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li style={{ marginBottom: '8px' }}><strong>Microbiome Balance Dashboard:</strong> A real-time gauge calculating if your scalp is 'Imbalanced' or 'Optimal.'</li>
                    <li style={{ marginBottom: '8px' }}><strong>Consistency Score:</strong> Tracks how strictly you adhere to your clinical routine to warn you of impending damage.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Lifetime Archive:</strong> A living calendar showing every chemical applied, salon visit, and photograph from Day 1.</li>
                    <li><strong>Monthly Cellular Narrative:</strong> At the end of every month, the AI cross-references your Ghost Camera photos with your chemical logs to give you the biological truth about your routine.</li>
                </ul>
            </div>

            {/* PART 3 */}
            <div className="card mb-lg" style={{ border: '2px solid var(--gold-400)', background: 'var(--bg-tertiary)' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: 'var(--space-md)', color: 'var(--gold-600)' }}>
                    Part 3: The Master Stylist Connection (X-Ray Vision)
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                    Using CrownCare alone is incredibly powerful. But when you find a trustworthy Hairstylist and hand them the keys to your data, your results accelerate exponentially. Entering their VIP Code grants them "X-Ray Vision" into your bathroom routine.
                </p>
                
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>How the Connection Works</h4>
                <ul style={{ paddingLeft: '20px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-md)' }}>
                    <li style={{ marginBottom: '4px' }}><strong>The Stylist Code:</strong> Your Stylist will give you their unique B2B Master Code (e.g., SARAH20).</li>
                    <li><strong>The Link:</strong> Enter that code into your app. The instant you do, your Lifetime Digital Diary is securely linked directly to your Stylist's private B2B Dashboard.</li>
                </ul>

                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>The Ultimate Benefits</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                    When you sit in a salon chair and complain about sudden breakage, 99% of stylists have to guess what caused it. When you connect via CrownCare, your stylist is granted "X-Ray Vision."
                </p>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        <BarChart2 size={16} /> Remote Biological Monitoring
                    </h5>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Your Stylist can open their Dashboard and look directly at your Lifetime Digital Diary. They possess your full Arsenal of Reports. They will literally see exactly which days you missed your protein treatment, and they will look at your Ghost Camera photos to spot inflammation weeks before it causes severe breakage!
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        <Zap size={16} /> Custom B2B Prescriptions
                    </h5>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        If your Stylist notices your Microbiome Score dropping, they can digitally "Prescribe" a treatment. When you wake up, a notification appears on your Treatment Tracker: <em>"New Treatment Prescribed by Master Stylist Sarah: Clarifying Shampoo (Use immediately)."</em>
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        <ShieldCheck size={16} /> Automated Stylist Passive Income
                    </h5>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        For utilizing this highly advanced portal to monitor you, the Stylist is provided with elite B2B professional networking tools directly through CrownCare.
                    </p>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic', color: 'var(--gold-600)', marginTop: 'var(--space-md)', lineHeight: 1.5 }}>
                    By connecting your Core Pages to a Master Professional, you ensure you never accidentally damage your hair again. You are always being monitored, diagnosed, and protected by a professional—even when you are 3,000 miles away from their salon chair.
                </p>
            </div>

        </div>
    );
}
