import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function PWAGhostCamera({ onCapture, onClose, ghostImage }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [captured, setCaptured] = useState(null);
    const [opacity, setOpacity] = useState(0.5);
    const [facingMode, setFacingMode] = useState('environment'); // Rear camera preferred

    const initCamera = useCallback(async () => {
        try {
            if (stream) { stream.getTracks().forEach(t => t.stop()); }
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("WebRTC Camera Error (Falling back to native):", err);
            // Fallback to Capacitor camera
            try {
                const image = await Camera.getPhoto({
                    quality: 60,
                    allowEditing: false,
                    resultType: CameraResultType.DataUrl,
                    source: CameraSource.Camera,
                    width: 800
                });
                onCapture(image.dataUrl);
            } catch (capErr) {
                onClose();
            }
        }
    }, [facingMode]);

    useEffect(() => {
        initCamera();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [facingMode]);

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Mirror horizontally if front camera
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCaptured(dataUrl);
    };

    const confirmPhoto = () => {
        onCapture(captured);
    };

    if (captured) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <button onClick={() => setCaptured(null)} style={styles.iconBtn}><X color="white" /></button>
                    <span style={{color: 'white', fontWeight: 600}}>Review Alignment</span>
                    <button onClick={confirmPhoto} style={styles.iconBtn}><Check color="#FCD34D" /></button>
                </div>
                <img src={captured} style={styles.preview} alt="Captured" />
                <div style={styles.footer}>
                    <button onClick={confirmPhoto} style={styles.captureBtn}>Save to Visual Diary</button>
                    <button onClick={() => setCaptured(null)} style={{...styles.captureBtn, background: 'rgba(255,255,255,0.2)', color: 'white'}}>Retake</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onClose} style={styles.iconBtn}><X color="white" /></button>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <span style={{color: '#FCD34D', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px'}}>Ghost Overlay™</span>
                    {ghostImage && <span style={{color: 'white', fontSize: '10px', opacity: 0.8}}>Align with previous photo</span>}
                </div>
                <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} style={styles.iconBtn}><RefreshCw color="white" size={18} /></button>
            </div>

            <div style={styles.viewfinder}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{...styles.video, transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'}}
                />
                
                {/* THE GHOST OVERLAY */}
                {ghostImage && (
                    <img 
                        src={ghostImage} 
                        style={{...styles.ghost, opacity: opacity}} 
                        alt="Ghost Overlay" 
                    />
                )}
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {ghostImage && (
                    <div style={styles.sliderContainer}>
                        <span style={{color: 'white', fontSize: 13, fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>Ghost Opacity</span>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.1" 
                            value={opacity} 
                            onChange={e => setOpacity(parseFloat(e.target.value))}
                            style={styles.slider}
                        />
                    </div>
                )}
            </div>

            <div style={styles.footer}>
                <button onClick={takePhoto} style={styles.shutterBtn}>
                    <div style={styles.shutterInner}></div>
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#050508', zIndex: 9999, display: 'flex', flexDirection: 'column'
    },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 20px', zIndex: 20, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
    },
    iconBtn: {
        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', backdropFilter: 'blur(10px)'
    },
    viewfinder: {
        flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    video: {
        width: '100%', height: '100%', objectFit: 'cover', position: 'absolute'
    },
    ghost: {
        width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', pointerEvents: 'none', filter: 'contrast(1.2)'
    },
    preview: {
        flex: 1, width: '100%', objectFit: 'contain', backgroundColor: '#000'
    },
    sliderContainer: {
        position: 'absolute', bottom: '20px', left: '10%', right: '10%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 20,
        background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(10px)'
    },
    slider: {
        width: '100%', accentColor: '#FCD34D'
    },
    footer: {
        height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', backgroundColor: '#050508', zIndex: 20, paddingBottom: '30px'
    },
    shutterBtn: {
        width: 80, height: 80, borderRadius: '50%', backgroundColor: 'transparent', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    shutterInner: {
        width: 64, height: 64, borderRadius: '50%', backgroundColor: 'white'
    },
    captureBtn: {
        padding: '16px 24px', borderRadius: '100px', border: 'none', backgroundColor: '#FCD34D', color: '#050508', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap'
    }
};
