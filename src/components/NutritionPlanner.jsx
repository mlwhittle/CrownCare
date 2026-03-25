import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Salad, CheckCircle2, AlertTriangle, UtensilsCrossed, Leaf, Sparkles, RefreshCcw, Camera as CameraIcon, X } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { loadApiKey, scanMealWithGemini } from '../services/GeminiService';
import nutritionImg from '../assets/images/nutrition.png';
import './NutritionPlanner.css';

const NUTRIENTS = [
    { id: 'protein', label: 'Protein', icon: '🥩', desc: 'Keratin building block — aim for 0.8–1g per kg bodyweight', unit: '' },
    { id: 'omega3', label: 'Omega-3', icon: '🐟', desc: 'Reduces scalp inflammation, supports follicle health', unit: '' },
    { id: 'iron', label: 'Iron', icon: '🥬', desc: 'Ferritin < 40 ng/mL linked to shedding — get tested', unit: '' },
    { id: 'zinc', label: 'Zinc', icon: '🎃', desc: 'Critical for tissue growth and repair', unit: '' },
    { id: 'vitC', label: 'Vitamin C', icon: '🍊', desc: 'Enhances iron absorption — pair with iron-rich foods', unit: '' },
    { id: 'vitD', label: 'Vitamin D', icon: '☀️', desc: 'Deficiency linked to alopecia areata', unit: '' },
];

const DHT_RECIPES = [
    {
        id: 'green-tea',
        title: 'Green Tea Smoothie',
        icon: '🍵',
        desc: 'EGCG in green tea inhibits 5-alpha reductase, the enzyme that converts testosterone to DHT.',
        ingredients: ['1 cup brewed green tea (cooled)', '1 banana', '1 cup spinach', '1 tbsp flaxseed', 'Honey to taste'],
    },
    {
        id: 'pumpkin-seed',
        title: 'Pumpkin Seed Pesto Pasta',
        icon: '🎃',
        desc: 'Pumpkin seed oil has been shown to reduce DHT levels and promote hair growth in clinical studies.',
        ingredients: ['½ cup pumpkin seeds (toasted)', '2 cups fresh basil', '2 cloves garlic', '¼ cup olive oil', 'Salt, pepper, pasta of choice'],
    },
    {
        id: 'turmeric-bowl',
        title: 'Golden Turmeric Bowl',
        icon: '🥣',
        desc: 'Curcumin in turmeric has anti-androgenic properties that may help lower DHT.',
        ingredients: ['1 cup quinoa', '1 tsp turmeric powder', '½ cup edamame', 'Sliced avocado', 'Coconut oil drizzle', 'Sesame seeds'],
    },
    {
        id: 'onion-soup',
        title: 'Quercetin-Rich Onion Soup',
        icon: '🧅',
        desc: 'Quercetin (found in onions) inhibits DHT production and is an anti-inflammatory.',
        ingredients: ['3 large onions (caramelized)', 'Bone broth', 'Fresh thyme', 'Whole grain bread', 'Gruyère cheese (optional)'],
    },
    {
        id: 'coconut-curry',
        title: 'Coconut Oil Veggie Curry',
        icon: '🥥',
        desc: 'Lauric acid in coconut oil may inhibit 5-alpha reductase activity.',
        ingredients: ['2 tbsp coconut oil', 'Sweet potato, chickpeas', 'Spinach, bell peppers', 'Coconut milk', 'Curry powder, ginger, garlic'],
    },
];

export default function NutritionPlanner() {
    const { nutritionLogs, getTodayNutrition, saveNutrition } = useApp();
    const today = getTodayNutrition();
    const [checks, setChecks] = useState(today?.checks || {});
    const [waterGlasses, setWaterGlasses] = useState(today?.water || 0);
    const [dhtChecks, setDhtChecks] = useState(today?.dhtChecks || {});
    const [openRecipe, setOpenRecipe] = useState(null);
    const [shuffleIndex, setShuffleIndex] = useState(0);
    const [customMeals, setCustomMeals] = useState(today?.customMeals || []);
    const [mealTypeForm, setMealTypeForm] = useState('breakfast');
    
    // AI Vision State
    const [isScanningMeal, setIsScanningMeal] = useState(false);
    const [mealScanResult, setMealScanResult] = useState(null);

    const handleMealScan = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 60, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Prompt, width: 800
            });
            setIsScanningMeal(true);
            const apiKey = loadApiKey();
            const result = await scanMealWithGemini(apiKey, image.dataUrl);
            
            if (result && result.macros) {
                const newChecks = { ...checks };
                Object.keys(result.macros).forEach(key => {
                    if (result.macros[key]) newChecks[key] = true;
                });
                setChecks(newChecks);
                saveEntry(newChecks, waterGlasses, dhtChecks, customMeals);
                setMealScanResult(result);
            } else {
                alert("The AI couldn't clearly identify the macros in that meal. Please check the boxes manually.");
            }
        } catch (e) {
            console.error("Meal Scan Canceled or Failed:", e);
        } finally {
            setIsScanningMeal(false);
        }
    };

    const saveEntry = (newChecks, newWater, newDht, newCustomMeals) => {
        saveNutrition({ 
            checks: newChecks, 
            water: newWater, 
            dhtChecks: newDht,
            customMeals: newCustomMeals || customMeals
        });
    };

    const toggle = (id) => {
        const updated = { ...checks, [id]: !checks[id] };
        setChecks(updated);
        saveEntry(updated, waterGlasses, dhtChecks, customMeals);
    };

    const updateWater = (v) => {
        setWaterGlasses(v);
        saveEntry(checks, v, dhtChecks, customMeals);
    };

    const toggleDht = (id, e) => {
        e.stopPropagation();
        const updated = { ...dhtChecks, [id]: !dhtChecks[id] };
        setDhtChecks(updated);
        saveEntry(checks, waterGlasses, updated, customMeals);
    };

    const logAiMeal = (mealTitle) => {
        const fullTitle = `${mealTypeForm.charAt(0).toUpperCase() + mealTypeForm.slice(1)}: ${mealTitle}`;
        if (customMeals.includes(fullTitle)) return;
        const updated = [...customMeals, fullTitle];
        setCustomMeals(updated);
        saveEntry(checks, waterGlasses, dhtChecks, updated);
    };

    const checkedCount = Object.values(checks).filter(Boolean).length;
    const dhtCheckedCount = Object.values(dhtChecks).filter(Boolean).length;

    const getRecommendations = () => {
        const recOptions = [];
        const type = mealTypeForm;
        
        if (checks.protein && checks.iron && !checks.vitC) {
            if (type === 'breakfast') recOptions.push([
                { icon: '🍓', title: 'Strawberry Spinach Smoothie', text: 'Boost iron absorption from your morning supplements with a Vitamin C rich smoothie.' },
                { icon: '🍳', title: 'Eggs & Bell Peppers', text: 'Pair iron-rich eggs with Vitamin C-packed bell peppers.' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🥗', title: 'Chicken & Mandarin Salad', text: 'Maximize iron absorption by pairing protein with citrus.' },
                { icon: '🍋', title: 'Lemon Herb Fish Wrap', text: 'Add a generous squeeze of lemon (Vitamin C).' }
            ]);
            else recOptions.push([
                { icon: '🥩', title: 'Steak & Citrus Salad', text: 'Maximize iron absorption to prevent shedding.' },
                { icon: '🥦', title: 'Beef & Broccoli Stir-fry', text: 'Broccoli is packed with Vitamin C to help you absorb the iron in the beef.' }
            ]);
        } else if (!checks.protein && !checks.iron) {
            if (type === 'breakfast') recOptions.push([
                { icon: '🥣', title: 'Quinoa & Hemp Oatmeal', text: 'Your follicles are missing structural building blocks today (Protein & Iron).' },
                { icon: '🌮', title: 'Black Bean Breakfast Taco', text: 'Load up on Keratin building blocks!' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🍲', title: 'Lentil & Kale Soup', text: 'A hearty lunch to prevent shedding.' },
                { icon: '🥗', title: 'Spinach & Steak Salad', text: 'Get those Iron and Protein numbers up mid-day.' }
            ]);
            else recOptions.push([
                { icon: '🥩', title: 'Lean Beef & Spinach Stew', text: 'A nutrient-dense dinner with lean beef.' },
                { icon: '🍛', title: 'Lentil & Quinoa Curry', text: 'A perfect dinner for follicle building blocks.' }
            ]);
        } else if (!checks.protein) {
            if (type === 'breakfast') recOptions.push([
                { icon: '🍳', title: 'Eggs & Avocado Toast', text: 'Hair is made of keratin (protein). Try eating 2-3 eggs.' },
                { icon: '🥛', title: 'Greek Yogurt Parfait', text: 'Greek yogurt is a fantastic, quick source of protein.' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🍗', title: 'Grilled Chicken Wrap', text: 'Lean protein is essential for hair growth.' },
                { icon: '🥫', title: 'Tuna Salad', text: 'Canned tuna is a cheap and highly bio-available protein.' }
            ]);
            else recOptions.push([
                { icon: '🐟', title: 'Baked Salmon', text: 'End your day with a high-protein fish.' },
                { icon: '🍗', title: 'Roast Chicken Breast', text: 'Provide the amino acids your hair needs overnight.' }
            ]);
        } else if (!checks.iron) {
            if (type === 'breakfast') recOptions.push([
                { icon: '🥬', title: 'Green Iron Smoothie', text: 'Low iron causes your body to pull oxygen away from your scalp.' },
                { icon: '🥣', title: 'Fortified Bran Cereal', text: 'Start with an iron-fortified cereal.' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🥬', title: 'Spinach & Black Bean Wrap', text: 'Replenish your ferritin levels during lunch.' },
                { icon: '🥗', title: 'Kale & Turkey Salad', text: 'Turkey and dark greens provide an iron punch.' }
            ]);
            else recOptions.push([
                { icon: '🥩', title: 'Lean Beef Stir-fry', text: 'Red meat is one of the most bioavailable sources of iron.' },
                { icon: '🦪', title: 'Oyster Mushroom Pasta', text: 'Mushrooms and dark leafy greens for dinner.' }
            ]);
        }
        
        if (!checks.omega3) {
             if (type === 'breakfast') recOptions.push([
                { icon: '🐟', title: 'Walnut & Chia Seed Oatmeal', text: 'To reduce scalp inflammation, add an Omega-3 source.' },
                { icon: '🥑', title: 'Avocado & Flax Smoothie', text: 'A creamy, Omega-3 rich morning drink.' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🍣', title: 'Salmon Sushi Roll', text: 'Fatty fish like salmon are incredible for Omega-3s.' },
                { icon: '🥗', title: 'Sardine Salad', text: 'Sardines are an Omega-3 powerhouse.' }
            ]);
            else recOptions.push([
                { icon: '🐟', title: 'Grilled Mackerel', text: 'Keep your scalp hydrated and reduce inflammation overnight.' },
                { icon: '🥑', title: 'Chia Seed Pudding Bowl', text: 'A perfect Omega-3 rich dessert.' }
            ]);
        }
        
        if (dhtCheckedCount === 0) {
            if (type === 'breakfast') recOptions.push([
                { icon: '🍵', title: 'Matcha Green Tea Latte', text: 'The EGCG helps inhibit the enzyme that converts testosterone into DHT.' },
                { icon: '🎃', title: 'Pumpkin Seed Oatmeal', text: 'Protect your edges from hormonal thinning.' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🧅', title: 'Onion & Veggie Soup', text: 'Onions are rich in Quercetin, a potent DHT blocker.' },
                { icon: '🥗', title: 'Edamame Salad', text: 'Soy contains DHT-blocking phytoestrogens.' }
            ]);
            else recOptions.push([
                { icon: '🥥', title: 'Coconut Veggie Curry', text: 'Lauric acid in coconut oil blocks DHT.' },
                { icon: '🍵', title: 'Green Tea Poached Salmon', text: 'Double down on DHT blockers for dinner.' }
            ]);
        } else if (!checks.vitD) {
            if (type === 'breakfast') recOptions.push([
                { icon: '🍄', title: 'Mushroom & Egg Scramble', text: 'Vitamin D deficiency is heavily linked to alopecia.' },
                { icon: '☀️', title: 'Fortified Almond Milk', text: 'Have a glass of fortified plant milk.' }
            ]);
            else if (type === 'lunch') recOptions.push([
                { icon: '🐟', title: 'Tuna Salad Sandwich', text: 'Canned tuna is a great, accessible source of Vitamin D.' },
                { icon: '🥗', title: 'UV-Exposed Mushroom Salad', text: 'Mushrooms left in the sun generate Vitamin D.' }
            ]);
            else recOptions.push([
                { icon: '🐟', title: 'Baked Trout', text: 'Excellent source of Vitamin D to keep follicles functioning.' },
                { icon: '🍳', title: 'Breakfast-for-Dinner Eggs', text: 'Egg yolks are a natural Vitamin D source.' }
            ]);
        }

        if (recOptions.length === 0) {
            recOptions.push([
                { icon: '🌟', title: 'The Ultimate Hair Guardian Meal', text: 'You hit your macros today! Maintain this state!' }
            ]);
        }

        const recs = recOptions.map(optionsList => {
            return optionsList[shuffleIndex % optionsList.length];
        });

        // Add 1 more default if we don't have enough to show 3
        while (recs.length < 3) {
            recs.push({ icon: '🍲', title: `${type === 'breakfast' ? 'Morning' : type === 'lunch' ? 'Midday' : 'Evening'} Follicle Boost`, text: 'Keep up the healthy eating to support your goals.' });
        }

        return recs.slice(0, 3); // top 3 recs
    };

    const recommendations = getRecommendations();

    return (
        <div className="nutrition">
            <img src={nutritionImg} alt="Healthy Nutrition" className="page-header-img" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '1px', color: '#FCD34D', textTransform: 'uppercase', marginBottom: '1.5rem', marginTop: '1rem' }}>Nutrition Planner</h2>

            <div className="home-intro-text" style={{ marginTop: 'var(--space-md)' }}>
                <p style={{ marginBottom: 'var(--space-sm)' }}>
                    When you ask a hair expert why food matters, the answer is simple but powerful: your hair is made mostly of protein, and your body will not “waste” nutrients on hair if it thinks something more important—like your heart or brain—needs them first.
                </p>
                <p style={{ marginBottom: 'var(--space-sm)' }}>
                    Hair follicles are some of the fastest-growing cells in the body, so they need steady fuel: protein to build the strand, iron to carry oxygen, healthy fats to keep the scalp moisturized, zinc for repair, and vitamins like A, D, and B (especially biotin) to support growth.
                </p>
                <p>
                    If your diet is low in these nutrients, your body shifts hair from the growth phase into a resting or shedding phase, which can lead to thinning, breakage, or slow growth—so healthy hair doesn’t start in the beauty aisle, it starts on your plate.
                </p>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-2xl)', background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-tertiary))', border: '1px solid var(--border-color)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Sparkles size={18} color="var(--primary)" />
                    How to Use Your Diet Diary
                </h4>
                <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                    Your nutrition isn't just a daily checklist—it's the fuel that dictates your <strong>Visual Diary</strong> results. By tracking your intake here, you are building a clinical record of what your follicles are consuming.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                        <span style={{ color: 'var(--brand-500)', fontWeight: 'bold' }}>1.</span>
                        <span className="text-muted text-sm" style={{ lineHeight: 1.4 }}>
                            <strong>Check off Macros:</strong> Tap the circle next to Protein, Iron, etc., when you consume them.
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                        <span style={{ color: 'var(--info)', fontWeight: 'bold' }}>2.</span>
                        <span className="text-muted text-sm" style={{ lineHeight: 1.4 }}>
                            <strong>Log Hydration:</strong> Tap a water droplet for every 8oz you drink.
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>3.</span>
                        <span className="text-muted text-sm" style={{ lineHeight: 1.4 }}>
                            <strong>Track Meals:</strong> If you eat a DHT-blocking meal (DHT is a hormone byproduct that shrinks hair follicles and causes thinning), tap its circle to save it to your diary.
                        </span>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <p className="text-sm" style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Everything you log instantly generates a timeline at the bottom of the page. This allows you to cross-reference your diet history with your monthly progress photos to see exactly what is working!
                    </p>
                </div>
            </div>
            {/* NEW: Progress Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(252, 211, 77, 0.2)', textAlign: 'center', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 25px rgba(252, 211, 77, 0.05)' }}>
                    <div style={{ position: 'relative', width: '110px', height: '110px', marginBottom: '1rem' }}>
                        <svg width="110" height="110" viewBox="0 0 100 100">
                            {/* Background track */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="6" />
                            {/* Progress ring */}
                            <circle 
                                cx="50" cy="50" r="40" fill="none" stroke="url(#goldGradient)" strokeWidth="6" 
                                strokeLinecap="round" strokeDasharray="251.2" 
                                strokeDashoffset={251.2 - (251.2 * (checkedCount / Math.max(1, NUTRIENTS.length)))}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} 
                            />
                            <defs>
                                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FCD34D" />
                                    <stop offset="100%" stopColor="#B45309" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round((checkedCount / Math.max(1, NUTRIENTS.length)) * 100)}%</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>Daily Harmony</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>{checkedCount} / {NUTRIENTS.length} ESSENTIALS</div>
                </div>

                <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(96, 165, 250, 0.2)', textAlign: 'center', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 25px rgba(96, 165, 250, 0.05)' }}>
                    <div style={{ position: 'relative', width: '110px', height: '110px', marginBottom: '1rem' }}>
                        <svg width="110" height="110" viewBox="0 0 100 100">
                            {/* Background track */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="6" />
                            {/* Progress ring */}
                            <circle 
                                cx="50" cy="50" r="40" fill="none" stroke="url(#blueGradient)" strokeWidth="6" 
                                strokeLinecap="round" strokeDasharray="251.2" 
                                strokeDashoffset={251.2 - (251.2 * (waterGlasses / 8))}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} 
                            />
                            <defs>
                                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#60A5FA" />
                                    <stop offset="100%" stopColor="#2563EB" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round((Math.min(waterGlasses, 8) / 8) * 100)}%</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>Hair Hydration</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--blue-500)', fontWeight: 600, letterSpacing: '0.5px' }}>{waterGlasses * 8} / 64 OZ</div>
                </div>
            </div>
            <div className="card-glass mb-lg" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02))', border: '1px solid var(--gold-200)', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', margin: 0, color: 'var(--gold-600)' }}>
                        <Salad size={20} /> Daily Nutrient Checklist
                        <span className="badge badge-blue">{checkedCount}/{NUTRIENTS.length}</span>
                    </h3>
                    <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #FCD34D 0%, #B45309 100%)', color: '#050508', border: 'none', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }} onClick={handleMealScan}>
                        <CameraIcon size={14} /> Auto-Scan Meal
                    </button>
                </div>
                
                {isScanningMeal && (
                    <div style={{ padding: 'var(--space-xl)', textAlign: 'center', background: 'rgba(252, 211, 77, 0.05)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', border: '1px solid rgba(252, 211, 77, 0.2)' }}>
                        <div style={{ width: 30, height: 30, border: '3px solid rgba(252,211,77,0.2)', borderTop: '3px solid #FCD34D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
                        <p style={{ color: '#FCD34D', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1.5s infinite', margin: 0 }}>Analyzing Macro Breakdown...</p>
                    </div>
                )}

                {mealScanResult && (
                    <div className="card" style={{ marginBottom: 'var(--space-md)', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--success)', position: 'relative' }}>
                        <button onClick={() => setMealScanResult(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={16}/></button>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', marginBottom: '8px' }}><CheckCircle2 size={16}/> Macros Detected!</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                            {mealScanResult.detected && mealScanResult.detected.map(item => (
                                <span key={item} style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}>{item}</span>
                            ))}
                        </div>
                        <p className="text-sm text-muted" style={{ margin: 0 }}>{mealScanResult.feedback}</p>
                    </div>
                )}
                {NUTRIENTS.map(n => (
                    <label key={n.id} className="nutrient-row" onClick={() => toggle(n.id)}>
                        <div className={`nutrient-check ${checks[n.id] ? 'done' : ''}`}>
                            {checks[n.id] ? <CheckCircle2 size={20} /> : <div className="check-empty" />}
                        </div>
                        <span className="nutrient-icon">{n.icon}</span>
                        <div className="nutrient-info">
                            <strong>{n.label}</strong>
                            <span>{n.desc}</span>
                        </div>
                    </label>
                ))}

                {/* Biotin warning */}
                <div className="biotin-warning">
                    <AlertTriangle size={16} />
                    <div>
                        <strong>Biotin Warning</strong>
                        <p>Excessive biotin (Vitamin B7) supplementation can falsely alter important lab results, especially thyroid panels and troponin tests. Consult your doctor before taking high-dose biotin.</p>
                    </div>
                </div>
            </div>

            {/* Water tracker */}
            <div className="card mb-lg">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>💧 Hydration ({waterGlasses * 8} oz / 64 oz)</h3>
                <div className="water-track">
                    {Array.from({ length: 8 }, (_, i) => (
                        <button
                            key={i}
                            className={`water-glass ${i < waterGlasses ? 'filled' : ''}`}
                            onClick={() => updateWater(i < waterGlasses ? i : i + 1)}
                        >
                            💧
                        </button>
                    ))}
                </div>
            </div>

            {/* Smart Meal Recommendations */}
            <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02))', border: '1px solid var(--gold-200)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', color: 'var(--gold-600)' }}>
                    <Sparkles size={20} /> Clinical Meal Suggestions
                </h3>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                    Based on your logs today, here are suggested meals to balance your follicle nutrition profile:
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    {['Breakfast', 'Lunch', 'Dinner'].map(mt => (
                        <button 
                           key={mt}
                           onClick={() => setMealTypeForm(mt.toLowerCase())}
                           style={{ 
                               flex: 1, 
                               padding: '8px', 
                               borderRadius: '8px', 
                               border: 'none', 
                               background: mealTypeForm === mt.toLowerCase() ? 'var(--gold-500)' : 'transparent',
                               color: mealTypeForm === mt.toLowerCase() ? '#050508' : 'var(--text-secondary)',
                               fontWeight: 'bold',
                               fontSize: '0.85rem',
                               transition: 'all 0.2s'
                           }}
                        >
                            {mt}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {recommendations.length > 0 ? recommendations.map((rec, i) => {
                        const fullLogTitle = `${mealTypeForm.charAt(0).toUpperCase() + mealTypeForm.slice(1)}: ${rec.title}`;
                        const isLogged = customMeals?.includes(fullLogTitle);

                        return (
                            <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold-400)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{rec.icon}</span>
                                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{rec.title}</strong>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '34px', lineHeight: 1.5, marginBottom: '12px' }}>{rec.text}</p>
                                <button 
                                    onClick={() => logAiMeal(rec.title)}
                                    disabled={isLogged}
                                    style={{ 
                                        marginLeft: '34px', 
                                        padding: '6px 12px', 
                                        border: isLogged ? '1px solid var(--success)' : '1px solid var(--gold-300)', 
                                        background: isLogged ? 'rgba(80, 200, 120, 0.1)' : 'transparent', 
                                        color: isLogged ? 'var(--success)' : 'var(--gold-600)', 
                                        borderRadius: '8px', 
                                        cursor: isLogged ? 'default' : 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {isLogged ? <CheckCircle2 size={14} /> : <div style={{ fontSize: '14px', lineHeight: '14px', marginTop:'-2px' }}>+</div>}
                                    {isLogged ? 'Logged in Diary' : 'Log This Suggestion'}
                                </button>
                            </div>
                        );
                    }) : (
                        <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Log your macros above to get personalized meal recommendations!
                        </div>
                    )}
                </div>
                {recommendations.length > 0 && (
                    <button 
                        className="btn btn-outline" 
                        style={{ width: '100%', marginTop: 'var(--space-md)', borderColor: 'var(--gold-300)', color: 'var(--gold-600)' }}
                        onClick={() => setShuffleIndex(prev => prev + 1)}
                    >
                        <RefreshCcw size={16} /> Shuffle Meal Ideas
                    </button>
                )}
            </div>

            {/* DHT-blocking recipes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', margin: 0 }}>
                    <Leaf size={18} /> DHT-Blocking Meals
                </h3>
                <span className="badge badge-green">{dhtCheckedCount}/{DHT_RECIPES.length} logged</span>
            </div>
            <div className="recipe-grid">
                {DHT_RECIPES.map(r => (
                    <div key={r.id} className={`recipe-card ${dhtChecks[r.id] ? 'logged' : ''}`} onClick={() => setOpenRecipe(openRecipe === r.id ? null : r.id)} style={{ border: dhtChecks[r.id] ? '2px solid var(--success)' : 'none' }}>
                        <div className="recipe-header" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                            <div
                                className="nutrient-check"
                                style={{ marginTop: '2px', padding: '10px', margin: '-10px', cursor: 'pointer' }}
                                onClick={(e) => toggleDht(r.id, e)}
                            >
                                {dhtChecks[r.id] ? <CheckCircle2 size={26} color="var(--success)" fill="rgba(80, 200, 120, 0.1)" /> : <div className="check-empty" style={{ width: 26, height: 26 }} />}
                            </div>
                            <span className="recipe-emoji" style={{ fontSize: '1.5rem', marginTop: '2px' }}>{r.icon}</span>
                            <div style={{ flex: 1 }}>
                                <strong>{r.title}</strong>
                                <p className="text-xs text-muted mt-xs">{r.desc}</p>
                            </div>
                        </div>
                        {openRecipe === r.id && (
                            <div className="recipe-body" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-color)' }}>
                                <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gold-600)', marginBottom: 'var(--space-sm)' }}>Ingredients:</h4>
                                <ul style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                                    {r.ingredients.map((ing, i) => <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', padding: '2px 0' }}>{ing}</li>)}
                                </ul>
                                <button
                                    className={`btn ${dhtChecks[r.id] ? 'btn-secondary' : 'btn-primary'}`}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={(e) => toggleDht(r.id, e)}
                                >
                                    {dhtChecks[r.id] ? <><CheckCircle2 size={18} /> Meal Logged in Diary</> : 'Tap to Log This Meal'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Nutrition Diary History */}
            {nutritionLogs.length > 0 && (
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <UtensilsCrossed size={18} /> My Diet Diary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {[...nutritionLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).map(log => {
                            const dateObj = new Date(log.date);
                            const fmtDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                            const cCount = log.checks ? Object.values(log.checks).filter(Boolean).length : 0;
                            const dCount = log.dhtChecks ? Object.values(log.dhtChecks).filter(Boolean).length : 0;
                            const wOz = (log.water || 0) * 8;

                            // Only show days where they actually logged *something*
                            if (cCount === 0 && dCount === 0 && wOz === 0) return null;

                            // Extract the human-readable names of the selected items
                            const selectedNutrients = log.checks
                                ? Object.keys(log.checks).filter(k => log.checks[k]).map(k => NUTRIENTS.find(n => n.id === k)?.label).filter(Boolean).join(', ')
                                : '';
                                
                            const dhtMeals = log.dhtChecks
                                ? Object.keys(log.dhtChecks).filter(k => log.dhtChecks[k]).map(k => DHT_RECIPES.find(r => r.id === k)?.title).filter(Boolean)
                                : [];
                            
                            const aiMeals = log.customMeals || [];
                            const combinedMeals = [...dhtMeals, ...aiMeals].join(', ');

                            return (
                                <div key={log.id} className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--brand-400)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>{fmtDate}</strong>
                                        <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                            {wOz} oz Water
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Salad size={14} /> {cCount} Macros
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Leaf size={14} /> {dhtMeals.length}(DHT) + {aiMeals.length}(AI) Meals
                                        </div>
                                    </div>
                                    {(selectedNutrients || combinedMeals) && (
                                        <div style={{ marginTop: 'var(--space-sm)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {selectedNutrients && <div style={{ marginBottom: combinedMeals ? '4px' : 0 }}><strong style={{ color: 'var(--text-primary)' }}>Macros:</strong> {selectedNutrients}</div>}
                                            {combinedMeals && <div><strong style={{ color: 'var(--text-primary)' }}>Meals:</strong> {combinedMeals}</div>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ height: '80px' }} /> {/* scroll spacer */}
        </div>
    );
}
