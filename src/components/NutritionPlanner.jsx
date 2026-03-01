import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Salad, CheckCircle2, AlertTriangle, UtensilsCrossed, Leaf } from 'lucide-react';
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
    const { getTodayNutrition, saveNutrition } = useApp();
    const today = getTodayNutrition();
    const [checks, setChecks] = useState(today?.checks || {});
    const [waterGlasses, setWaterGlasses] = useState(today?.water || 0);
    const [openRecipe, setOpenRecipe] = useState(null);

    const toggle = (id) => {
        const updated = { ...checks, [id]: !checks[id] };
        setChecks(updated);
        saveNutrition({ checks: updated, water: waterGlasses });
    };

    const updateWater = (v) => {
        setWaterGlasses(v);
        saveNutrition({ checks, water: v });
    };

    const checkedCount = Object.values(checks).filter(Boolean).length;

    return (
        <div className="nutrition">
            <img src={nutritionImg} alt="Healthy Nutrition" className="page-header-img" />
            <h2 className="gradient-text">Nutrition Planner</h2>

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

            <p className="text-muted text-sm mb-lg">Track daily hair-building nutrients and explore DHT-blocking meal ideas.</p>

            {/* Daily checklist */}
            <div className="card mb-lg">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                    <Salad size={20} /> Daily Nutrient Checklist
                    <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{checkedCount}/{NUTRIENTS.length}</span>
                </h3>
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
                <h3 style={{ marginBottom: 'var(--space-md)' }}>💧 Hydration ({waterGlasses}/8 glasses)</h3>
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

            {/* DHT-blocking recipes */}
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <Leaf size={18} /> DHT-Blocking Meal Ideas
            </h3>
            <div className="recipe-grid">
                {DHT_RECIPES.map(r => (
                    <div key={r.id} className="recipe-card" onClick={() => setOpenRecipe(openRecipe === r.id ? null : r.id)}>
                        <div className="recipe-header">
                            <span className="recipe-emoji">{r.icon}</span>
                            <div>
                                <strong>{r.title}</strong>
                                <p className="text-xs text-muted">{r.desc}</p>
                            </div>
                        </div>
                        {openRecipe === r.id && (
                            <div className="recipe-body">
                                <h4>Ingredients:</h4>
                                <ul>{r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
