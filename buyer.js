// --- State ---
const getSellerItems = () => {
    try {
        const saved = localStorage.getItem('wasteless_items');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
};

const getBuyerItems = () => {
    try {
        const saved = localStorage.getItem('wasteless_buyer_items');
        // Default items for new buyers
        const defaults = [
            { id: 991, name: 'Leftover Rice 🍚', qty: 1, expiry: '2026-02-15' }, // Default for recipe demo
        ];
        return saved ? JSON.parse(saved) : defaults;
    } catch (e) { return []; }
};

const state = {
    currentTab: 'market', // Default tab
    marketItems: getSellerItems(),
    myItems: getBuyerItems(),
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
    if (n.includes('milk') || n.includes('yogurt') || n.includes('cheese') || n.includes('butter')) return '🥛';
    if (n.includes('rice') || n.includes('grain') || n.includes('pasta')) return '🍚';
    if (n.includes('apple') || n.includes('fruit') || n.includes('banana')) return '🍎';
    if (n.includes('carrot') || n.includes('veg') || n.includes('salad')) return '🥕';
    if (n.includes('bread') || n.includes('toast') || n.includes('bagel')) return '🍞';
    if (n.includes('meat') || n.includes('chicken') || n.includes('beef')) return '🥩';
    if (n.includes('fish') || n.includes('tuna')) return '🐟';
    if (n.includes('egg')) return '🥚';
    if (n.includes('coffee') || n.includes('tea')) return '☕';
    return '🥡';
};

const saveBuyerItems = () => {
    localStorage.setItem('wasteless_buyer_items', JSON.stringify(state.myItems));
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

const renderMarketplace = () => {
    pageTitle.textContent = "Wasteless - Market";
    fabAdd.classList.add('hidden');

    // Filter for items ON SALE from Sellers
    const itemsForSale = state.marketItems.filter(i => i.forSale);

    if (itemsForSale.length === 0) {
        contentArea.innerHTML = `
            <div style="text-align: center; margin-top: 3rem; color: var(--text-muted);">
                <i data-lucide="store" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No items in the market yet.</p>
                <small>Check back later for rescued food!</small>
            </div>
        `;
    } else {
        const itemsHtml = itemsForSale.map(item => {
            const icon = getFoodIcon(item.name);
            // Mock Seller Score logic (persistent based on item ID or random)
            const score = (4.0 + (item.id % 10) / 10).toFixed(1);

            return `
            <div class="glass-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <div class="food-icon-wrapper">${icon}</div>
                        <div>
                            <h3>${item.name}</h3>
                            <div class="card-meta">Qty: ${item.qty} • Expires: ${item.expiry}</div>
                            <div style="margin-top:0.5rem; font-weight:bold; color:var(--primary);">$${item.price || 'Free'}</div>
                            
                            <div onclick="viewSellerProfile(${item.id})" style="margin-top:0.25rem; font-size:0.8rem; color:var(--secondary); display:flex; align-items:center; gap:0.25rem; cursor:pointer; background:rgba(255,255,255,0.5); padding:4px 8px; border-radius:10px; width:fit-content; transition:0.2s;">
                                <i data-lucide="shield-check" style="width:14px;"></i>
                                <span style="text-decoration:underline;">Seller Trust: <strong>${score}/5.0</strong></span>
                            </div>
                        </div>
                    </div>
                    <button onclick="buyItem(${item.id})" class="gradient-btn-full" style="width:auto; padding:0.5rem 1rem; margin-top:0;">Buy</button>
                </div>
            </div>
            `;
        }).join('');

        contentArea.innerHTML = `<div class="items-grid">${itemsHtml}</div>`;
    }
    initIcons();
};

window.viewSellerProfile = (id) => {
    // Mock Seller Data Generator based on Item ID
    const names = ["Alice Green", "Chef Bob", "Pantry Saver", "EcoWarrior99"];
    const name = names[id % names.length];
    const score = (4.0 + (id % 10) / 10).toFixed(1);

    document.getElementById('seller-name').textContent = name;
    document.getElementById('seller-score').textContent = score;
    document.getElementById('seller-impact').textContent = `${(id * 2.5).toFixed(1)}kg`;

    document.getElementById('seller-modal').classList.remove('hidden');
};

const renderMyKitchen = () => {
    pageTitle.textContent = "My Kitchen (Leftovers)";
    fabAdd.classList.remove('hidden'); // Enable Adding Leftovers

    // Sort items
    const sortedItems = [...state.myItems].sort((a, b) => {
        return getStatus(a.expiry).sort - getStatus(b.expiry).sort;
    });

    if (sortedItems.length === 0) {
        contentArea.innerHTML = `
            <div style="text-align: center; margin-top: 3rem; color: var(--text-muted);">
                <i data-lucide="utensils" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Your kitchen is empty.</p>
                <p style="font-size:0.9rem;">Add leftovers or buy from the market!</p>
            </div>
        `;
    } else {
        const itemsHtml = sortedItems.map(item => {
            const status = getStatus(item.expiry);
            const icon = getFoodIcon(item.name);
            return `
            <div class="glass-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <div class="food-icon-wrapper">${icon}</div>
                        <div>
                            <h3>${item.name}</h3>
                            <div class="card-meta">Qty: ${item.qty} • Expires: ${item.expiry}</div>
                            <span class="status-badge ${status.class}">${status.label}</span>
                        </div>
                    </div>
                    <button onclick="deleteBuyerItem(${item.id})" class="icon-btn danger-btn">
                        <i data-lucide="trash-2"></i>
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
    pageTitle.textContent = "Waste Predictor";
    fabAdd.classList.add('hidden');

    const freshCount = state.myItems.filter(i => getStatus(i.expiry).label === 'Fresh').length;
    const riskCount = state.myItems.filter(i => getStatus(i.expiry).label === 'At Risk').length;
    const expiredCount = state.myItems.filter(i => getStatus(i.expiry).label === 'Expired').length;

    // Alert Notification Logic inside Predict
    let alertHtml = '';
    if (riskCount > 0 || expiredCount > 0) {
        alertHtml = `
            <div class="glass-card" style="border-left: 4px solid #ef4444; background: rgba(254, 226, 226, 0.5);">
                <div style="display:flex; align-items:center; gap:1rem;">
                    <i data-lucide="alert-triangle" style="color: #ef4444;"></i>
                    <div>
                        <h3 style="color: #b91c1c;">Expiry Alert!</h3>
                        <p style="font-size:0.9rem;">You have ${riskCount + expiredCount} items expiring soon or expired.</p>
                    </div>
                </div>
            </div>
        `;
    }

    contentArea.innerHTML = `
        <div class="items-grid" style="padding-bottom:0;">
            ${alertHtml}
        </div>

        <div class="stats-grid">
            <div class="stat-card" style="border-color: #34d399;">
                <p style="color:#34d399; font-size: 0.9rem;">My Fresh Food</p>
                <div class="stat-number" style="color:#34d399;">${freshCount}</div>
            </div>
             <div class="stat-card" style="border-color: #fbbf24;">
                <p style="color:#fbbf24; font-size: 0.9rem;">Eat Soon</p>
                <div class="stat-number" style="color:#fbbf24;">${riskCount}</div>
            </div>
            <div class="stat-card" style="border-color: #ef4444;">
                <p style="color:#ef4444; font-size: 0.9rem;">Expired</p>
                <div class="stat-number" style="color:#ef4444;">${expiredCount}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white;">
                <p style="font-size: 0.9rem;">Total Items</p>
                <div class="stat-number">${state.myItems.length}</div>
            </div>
        </div>
        
        <div class="glass-card" style="display:block; margin: 0 1.5rem;">
            <h3 style="margin-bottom:0.5rem;"><i data-lucide="activity" style="width:16px; display:inline;"></i> Expiry Timeline</h3>
            <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">Visual health of your current leftovers.</p>
            
            ${state.myItems.length ? `
                <div style="width:100%; height:12px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden; display:flex;">
                    <div style="width:${(freshCount / state.myItems.length) * 100}%; background:#10b981;"></div>
                    <div style="width:${(riskCount / state.myItems.length) * 100}%; background:#f59e0b;"></div>
                    <div style="width:${(expiredCount / state.myItems.length) * 100}%; background:#ef4444;"></div>
                </div>
            ` : '<p style="text-align:center; font-style:italic;">No data available.</p>'}
            
            <div style="display:flex; justify-content:space-between; margin-top:0.5rem; font-size:0.8rem; color:var(--text-muted);">
                <span>Good</span><span>Warning</span><span>Critical</span>
            </div>
        </div>
    `;
    initIcons();
};

const renderTips = () => {
    pageTitle.textContent = "Smart Recipes";
    fabAdd.classList.add('hidden');

    // Recipes based on MY items
    const hasRice = state.myItems.some(i => i.name.toLowerCase().includes('rice'));
    const hasBread = state.myItems.some(i => i.name.toLowerCase().includes('bread'));
    const hasMilk = state.myItems.some(i => i.name.toLowerCase().includes('milk'));

    let recipeHtml = '';

    if (hasRice) {
        recipeHtml += `
        <div class="glass-card" style="background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(254, 243, 199, 0.9)); border: 1px solid #fcd34d;">
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                <div class="food-icon-wrapper" style="background:#fef3c7;">🍚</div>
                <div>
                    <h3 style="color:#b45309;">Leftover Rice?</h3>
                    <p style="font-size:0.8rem; color:#b45309;">Try these Indian classics:</p>
                </div>
            </div>
            <div style="display:grid; gap:0.5rem;">
                <div style="background:white; padding:0.5rem; border-radius:8px;"><strong>🍋 Lemon Rice</strong></div>
                <div style="background:white; padding:0.5rem; border-radius:8px;"><strong>🍅 Tomato Rice</strong></div>
            </div>
        </div>`;
    }

    if (hasBread) {
        recipeHtml += `
        <div class="glass-card" style="background: linear-gradient(135deg, #e0f2fe, #fff); border: 1px solid #7dd3fc;">
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                <div class="food-icon-wrapper" style="background:#e0f2fe;">🍞</div>
                <div>
                    <h3 style="color:#0369a1;">Stale Bread?</h3>
                    <p style="font-size:0.8rem; color:#0369a1;">Don't toss it!</p>
                </div>
            </div>
            <div style="display:grid; gap:0.5rem;">
                <div style="background:white; padding:0.5rem; border-radius:8px;"><strong>🥖 Bread Upma</strong></div>
                <div style="background:white; padding:0.5rem; border-radius:8px;"><strong>🥣 Bread Pudding</strong></div>
            </div>
        </div>`;
    }

    if (!recipeHtml) {
        recipeHtml = `
            <div class="glass-card">
                <h3>No specific ingredients found!</h3>
                <p>Add Rice, Bread, or Milk to your kitchen to see special recipes.</p>
            </div>
        `;
    }

    const tipsHtml = state.tips.map(tip => `
        <div class="glass-card" style="display:block;">
            <h3><i data-lucide="leaf" style="width:16px; color:var(--primary);"></i> ${tip.title}</h3>
            <p style="color:var(--text-muted); margin-top:0.5rem;">${tip.content}</p>
        </div>
    `).join('');

    // Inject Recipes + General Tips
    contentArea.innerHTML = `<div class="items-grid"> ${recipeHtml} ${tipsHtml} </div>`;
    initIcons();
};

const render = () => {
    contentArea.innerHTML = '';

    // Update Nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === state.currentTab);
    });

    switch (state.currentTab) {
        case 'market': renderMarketplace(); break;
        case 'kitchen': renderMyKitchen(); break;
        case 'tips': renderTips(); break;
        case 'predict': renderPredict(); break;
    }
};

// --- Actions ---

window.buyItem = (id) => {
    const item = state.marketItems.find(i => i.id === id);
    if (item) {
        // Clone item to My Items
        const boughtItem = { ...item, id: Date.now(), forSale: false };
        state.myItems.push(boughtItem);
        saveBuyerItems();
        alert(`Successfully bought ${item.name}! Added to your kitchen.`);
    }
};

window.deleteBuyerItem = (id) => {
    state.myItems = state.myItems.filter(i => i.id !== id);
    saveBuyerItems();
};

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

    state.myItems.push(newItem);
    saveBuyerItems();

    modalOverlay.classList.add('hidden');
    addItemForm.reset();
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    render();
});
