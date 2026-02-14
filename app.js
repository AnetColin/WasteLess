// --- State ---
const getSavedItems = () => {
    try {
        const saved = localStorage.getItem('wasteless_items');
        if (!saved) return null;

        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return null;

        // Filter out bad data (nulls, or items without names)
        return parsed.filter(i => i && typeof i === 'object' && i.name);
    } catch (e) {
        console.error("Data corruption detected, resetting inventory:", e);
        return null;
    }
};

const state = {
    currentTab: 'pantry',
    items: getSavedItems() || [
        { id: 1, name: 'Milk 🥛', qty: 1, expiry: '2026-02-20' },
        { id: 2, name: 'Avocados 🥑', qty: 3, expiry: '2026-02-18' },
        { id: 3, name: 'Yogurt 🍦', qty: 2, expiry: '2026-02-10' },
    ],
    tips: [
        { title: "Store Potatoes with Apples", content: "Apples release ethylene gas which keeps potatoes from sprouting!" },
        { title: "Revive Wilting Veggies", content: "Soak slightly wilted veggies in ice water for 30 mins to crisp them up." },
        { title: "Freeze Fresh Herbs", content: "Chop herbs and freeze them in olive oil in ice cube trays for instant flavor bombs." }
    ]
};

// --- DOM Elements ---
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const navItems = document.querySelectorAll('.nav-item');
const fabAdd = document.getElementById('fab-add');
const modalOverlay = document.getElementById('modal-container');
const closeModalBtn = document.getElementById('close-modal');
const addItemForm = document.getElementById('add-item-form');

// --- Icons Init ---
const initIcons = () => lucide.createIcons();

// --- Helpers ---
const getFoodIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('milk') || n.includes('yogurt') || n.includes('cheese')) return '🥛';
    if (n.includes('apple') || n.includes('fruit') || n.includes('banana')) return '🍎';
    if (n.includes('carrot') || n.includes('veg') || n.includes('salad')) return '🥕';
    if (n.includes('bread') || n.includes('toast') || n.includes('bagel')) return '🍞';
    if (n.includes('meat') || n.includes('chicken') || n.includes('beef')) return '🥩';
    if (n.includes('fish') || n.includes('tuna')) return '🐟';
    if (n.includes('egg')) return '🥚';
    if (n.includes('coffee') || n.includes('tea')) return '☕';
    return '🥡'; // Default takeout box
};

const saveItems = () => {
    localStorage.setItem('wasteless_items', JSON.stringify(state.items));
    render();
};

const getStatus = (expiryDateStr) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', class: 'status-expired', sort: 3 };
    if (diffDays <= 3) return { label: 'At Risk', class: 'status-risk', sort: 2 };
    return { label: 'Fresh', class: 'status-fresh', sort: 1 };
};

// --- Rendering Functions ---

const renderPantry = () => {
    pageTitle.textContent = "Wasteless - Pantry";

    // Sort items: Expired -> Risk -> Fresh
    const sortedItems = [...state.items].sort((a, b) => {
        return getStatus(a.expiry).sort - getStatus(b.expiry).sort;
    });

    if (sortedItems.length === 0) {
        contentArea.innerHTML = `
            <div style="text-align:center; margin-top: 3rem; opacity: 0.7;">
                <i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                <p>Your pantry is empty.<br>Add items to start tracking!</p>
            </div>
        `;
    } else {
        const itemsHtml = sortedItems.map(item => {
            const status = getStatus(item.expiry);
            const icon = getFoodIcon(item.name);
            return `
            <div class="glass-card">
                <div style="display:flex; align-items:center; gap: 1rem;">
                    <div class="food-icon-wrapper">${icon}</div>
                    <div class="card-content">
                        <h3>${item.name}</h3>
                        <div class="card-meta">Qty: ${item.qty} • Expires: ${item.expiry}</div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
                    <span class="status-badge ${status.class}">${status.label}</span>
                    <button onclick="deleteItem(${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                        <i data-lucide="trash-2" style="width:16px;"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');

        contentArea.innerHTML = `<div class="items-grid">${itemsHtml}</div>`;
    }
    initIcons();
};

const renderPredict = () => {
    pageTitle.textContent = "Wasteless - Predictor";

    const freshCount = state.items.filter(i => getStatus(i.expiry).label === 'Fresh').length;
    const riskCount = state.items.filter(i => getStatus(i.expiry).label === 'At Risk').length;
    const expiredCount = state.items.filter(i => getStatus(i.expiry).label === 'Expired').length;
    const moneySaved = freshCount * 5; // Mock calculation

    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="border-color: #34d399;">
                <p style="color:#34d399; font-size: 0.9rem;">Fresh Items</p>
                <div class="stat-number" style="color:#34d399;">${freshCount}</div>
            </div>
            <div class="stat-card" style="border-color: #ef4444;">
                <p style="color:#ef4444; font-size: 0.9rem;">Wasted</p>
                <div class="stat-number" style="color:#ef4444;">${expiredCount}</div>
            </div>
             <div class="stat-card" style="border-color: #fbbf24;">
                <p style="color:#fbbf24; font-size: 0.9rem;">Eat Soon</p>
                <div class="stat-number" style="color:#fbbf24;">${riskCount}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));">
                <p style="color:white; font-size: 0.9rem;">Money Saved</p>
                <div class="stat-number">$${moneySaved}</div>
            </div>
        </div>
        
        <div class="glass-card" style="display:block;">
            <h3 style="margin-bottom:0.5rem;">Inventory Health</h3>
            <div style="width:100%; height:12px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden; display:flex;">
                <div style="width:${(freshCount / state.items.length) * 100}%; background:#10b981;"></div>
                <div style="width:${(riskCount / state.items.length) * 100}%; background:#f59e0b;"></div>
                <div style="width:${(expiredCount / state.items.length) * 100}%; background:#ef4444;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:0.5rem; font-size:0.8rem; color:var(--text-muted);">
                <span>Good</span><span>Warning</span><span>Critical</span>
            </div>
        </div>
    `;
};

const renderTips = () => {
    pageTitle.textContent = "Wasteless - Tips";

    // 1. Detect Leftovers (Rice Logic)
    const hasRice = state.items.some(i => i.name.toLowerCase().includes('rice'));

    let recipeHtml = '';
    if (hasRice) {
        recipeHtml = `
        <div class="glass-card" style="background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(254, 243, 199, 0.9)); border: 1px solid #fcd34d;">
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                <div style="width:40px; height:40px; background:#fef3c7; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                    <span style="font-size:1.5rem;">🍚</span>
                </div>
                <div>
                    <h3 style="color:#b45309;">Leftover Magic: Rice Edition</h3>
                    <p style="font-size:0.8rem; color:#b45309;">We found rice in your pantry! Try these:</p>
                </div>
            </div>
            
            <div style="display:grid; gap:0.75rem;">
                <div style="background:rgba(255,255,255,0.6); padding:0.75rem; border-radius:12px;">
                    <strong>🍋 Lemon Rice (Chitranna)</strong>
                    <p style="font-size:0.85rem; color:#4b5563; margin-top:0.25rem;">Heat oil, add mustard seeds, curry leaves, turmeric, and peanuts. Mix with leftover rice and squeeze fresh lemon juice.</p>
                </div>
                <div style="background:rgba(255,255,255,0.6); padding:0.75rem; border-radius:12px;">
                    <strong>🍅 Tomato Rice</strong>
                    <p style="font-size:0.85rem; color:#4b5563; margin-top:0.25rem;">Sauté onions, spices, and chopped tomatoes until mushy. Mix in rice and garnish with coriander.</p>
                </div>
                <div style="background:rgba(255,255,255,0.6); padding:0.75rem; border-radius:12px;">
                    <strong>🧈 Ghee Rice</strong>
                    <p style="font-size:0.85rem; color:#4b5563; margin-top:0.25rem;">Roast cashews/raisins in ghee. Add whole spices (cardamom/cloves). Toss rice in the aromatic ghee and serve hot.</p>
                </div>
            </div>
        </div>
        `;
    }

    const tipsHtml = state.tips.map((tip, index) => `
        <div class="glass-card" style="display:block;">
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.5rem;">
                <div style="width:40px; height:40px; background:rgba(255,255,255,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="leaf" style="color:#10b981;"></i>
                </div>
                <h3>${tip.title}</h3>
            </div>
            <p style="color:var(--text-muted); line-height:1.5;">${tip.content}</p>
        </div>
    `).join('');

    // Inject Recipes + General Tips
    contentArea.innerHTML = `<div class="items-grid"> ${recipeHtml} ${tipsHtml} </div>`;
    initIcons();
};

const renderReminders = () => {
    pageTitle.textContent = "Wasteless - Alerts";
    const urgentItems = state.items.filter(i => {
        const status = getStatus(i.expiry);
        return status.label === 'At Risk' || status.label === 'Expired';
    });

    if (urgentItems.length === 0) {
        contentArea.innerHTML = `
             <div style="text-align:center; margin-top: 3rem; opacity: 0.7;">
                <i data-lucide="check-circle" style="width: 48px; height: 48px; margin-bottom: 1rem; color:#10b981;"></i>
                <p>All clear! Nothing expiring soon.</p>
            </div>
        `;
    } else {
        contentArea.innerHTML = urgentItems.map(item => {
            const status = getStatus(item.expiry);
            return `
            <div class="glass-card" style="border-left: 4px solid ${status.class === 'status-expired' ? '#ef4444' : '#fbbf24'};">
                 <div class="card-content">
                    <h3>${item.name}</h3>
                    <div class="card-meta">Expires: ${item.expiry}</div>
                </div>
                <span class="status-badge ${status.class}">${status.label}</span>
            </div>
            `;
        }).join('');
    }
};

const render = () => {
    // Nav Active State
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === state.currentTab);
    });

    // Content Switching
    switch (state.currentTab) {
        case 'pantry': renderPantry(); break;
        case 'predict': renderPredict(); break;
        case 'tips': renderTips(); break;
        case 'reminders': renderReminders(); break;
    }

    // FAB Visibility
    fabAdd.style.display = state.currentTab === 'pantry' ? 'flex' : 'none';
};

// --- Actions ---

window.deleteItem = (id) => {
    state.items = state.items.filter(i => i.id !== id);
    saveItems();
};

addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const qty = document.getElementById('item-qty').value;
    const expiry = document.getElementById('item-expiry').value;

    const newItem = {
        id: Date.now(),
        name,
        qty,
        expiry
    };

    state.items.push(newItem);
    saveItems();

    // Close modal
    modalOverlay.classList.add('hidden');
    addItemForm.reset();
});

// --- Event Listeners ---

navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        state.currentTab = btn.dataset.tab;
        render();
    });
});

fabAdd.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// --- Landing Page Logic ---
const landingPage = document.getElementById('landing-page');
const appMain = document.getElementById('app');
const loginBtn = document.getElementById('login-btn');
const totalWastedDisplay = document.getElementById('total-wasted-display');
const peopleFedDisplay = document.getElementById('people-fed-display');

const calculateImpact = () => {
    // Mock Calculation: Each item is avg 0.5kg
    // In a real app, you'd sum quantity * weight
    // Here we use ALL items as "Potential Waste Saved" logic

    const totalItems = state.items.reduce((acc, item) => acc + parseInt(item.qty), 0);
    const avgWeightPerItem = 0.5; // kg
    const totalWeight = (totalItems * avgWeightPerItem).toFixed(1);

    // Impact: 1 meal is approx 0.4kg. 
    const mealsProvided = Math.floor((totalItems * avgWeightPerItem) / 0.4);

    totalWastedDisplay.textContent = `${totalWeight} kg`;
    peopleFedDisplay.textContent = `${mealsProvided > 0 ? mealsProvided : 0} people`;

    // Update local storage tracking if needed
};

// --- Rendering Functions ---
// ... (existing render functions) ...

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Wasteless App Initializing...");

    const landingPage = document.getElementById('landing-page');
    const appMain = document.getElementById('app');

    // 1. Try to find the Login FORM first
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Login Form Submitted");

            // Simple visual validation
            const email = loginForm.querySelector('input[type="email"]').value;
            if (!email) {
                alert("Please enter an email address");
                return;
            }

            // Transition
            landingPage.style.opacity = '0';
            setTimeout(() => {
                landingPage.classList.add('hidden');
                appMain.classList.remove('hidden');
                render();
            }, 500);
        });
    }
    // 2. Fallback to Button (if form not found for some reason)
    else {
        const btn = document.getElementById('login-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                // Check if it's inside a form and prevent default if so
                if (btn.type === 'submit') e.preventDefault();

                landingPage.style.opacity = '0';
                setTimeout(() => {
                    landingPage.classList.add('hidden');
                    appMain.classList.remove('hidden');
                    render();
                }, 500);
            });
        }
    }

    calculateImpact();
    initIcons();
    render();
});
