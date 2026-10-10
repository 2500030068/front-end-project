// Global Constants
const BOT_NAMES = ["SBI_Foreclosures", "HDFC_Auctions", "Amit_Traders", "Karan_Wheels", "Muthoot_Gold", "Delhi_RealEstate", "SysAdmin_Auto", "Market_Maker"];
const locs = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"];
const conds = ["A+", "A", "B", "C", "Salvage"];

const categories = {
    'bank': { 
        items: [{t: "Foreclosed 2BHK Flat", p: 4500000}, {t: "Seized Mahindra Tractor", p: 350000}, {t: "Defaulted Shop Space", p: 2500000}, {t: "Seized Gold Ornaments 200g", p: 1400000}], 
        seller: "SBI Bank Recovery" 
    },
    'real_estate': { 
        items: [{t: "Premium 3BHK Villa", p: 12500000}, {t: "Open Agricultural Land (2 Acres)", p: 4000000}, {t: "Commercial Office Space", p: 35000000}, {t: "Beachfront Plot", p: 8500000}], 
        seller: "Open Market" 
    },
    'vehicles': { 
        items: [{t: "Tata Safari Accomplished", p: 1800000}, {t: "Mahindra Thar 4x4", p: 1400000}, {t: "Used Maruti Swift", p: 450000}, {t: "Toyota Fortuner Legender", p: 3800000}, {t: "Hero Splendor Plus", p: 45000}], 
        seller: "Auto Dealers Auth" 
    },
    'electronics': { 
        items: [{t: "Bulk Dell Laptops (50 Units)", p: 1200000}, {t: "Industrial Generator 500kVA", p: 800000}, {t: "Medical MRI Machine (Used)", p: 5500000}], 
        seller: "Liquidator Corp" 
    }
};

function getEndTime(minutes) { return Date.now() + (minutes * 60 * 1000); }
function randArr(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 1. Initialize Users (Bots look identical to regular users now)
if (!localStorage.getItem("users_v4")) {
    const users = [
        { username: "admin", password: "123", role: "admin", name: "System Admin" },
        { username: "rahul99", password: "123", role: "user", name: "Rahul Sharma" },
        { username: "seller1", password: "123", role: "seller", name: "Rajesh Dealership" }
    ];
    BOT_NAMES.forEach(bot => { users.push({ username: bot.toLowerCase(), password: "bot", role: "user", name: bot.replace("_", " ") }); });
    localStorage.setItem("users_v4", JSON.stringify(users));
}

// 2. Reusable Function to Generate Fresh Auctions
function createFreshAuctions(countPerCategory) {
    let newAuctions = [];
    Object.keys(categories).forEach(cat => {
        for(let i = 0; i < countPerCategory; i++) {
            let item = randArr(categories[cat].items);
            let price = item.p + (Math.random() * (item.p * 0.2)); // Slight random variance
            
            newAuctions.push({
                id: cat.substring(0,3).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000),
                category: cat,
                title: item.t,
                year: 2015 + Math.floor(Math.random() * 9),
                condition: randArr(conds),
                location: randArr(locs),
                seller: categories[cat].seller,
                basePrice: price,
                endTime: getEndTime(2 + Math.random() * 15), 
                bids: [{ bidder: "System", amount: Math.round(price), timeStamp: Date.now() }]
            });
        }
    });
    return newAuctions;
}

// 3. Initial Database Setup
if (!localStorage.getItem("auctions_v4")) {
    const initialAuctions = createFreshAuctions(15); // 60 total items
    localStorage.setItem("auctions_v4", JSON.stringify(initialAuctions));
}

// 4. THE MARKET MAKER: Auto-Replenishes the market if it dies
function maintainMarketHealth() {
    let auctions = JSON.parse(localStorage.getItem('auctions_v4')) || [];
    let activeAuctions = auctions.filter(a => Date.now() < a.endTime);
    
    // If there are less than 5 live items, inject 16 new ones!
    if (activeAuctions.length < 5) {
        const freshAuctions = createFreshAuctions(4); // 4 per category = 16 new items
        
        // Append them to the front so they show up at the top
        auctions = [...freshAuctions, ...auctions];
        localStorage.setItem('auctions_v4', JSON.stringify(auctions));
    }
}

// Call it immediately on script load (Checks health the moment any page is opened)
maintainMarketHealth();

// 5. Global Functions & Theme logic
function logout() { localStorage.removeItem("currentUser"); window.location.href = "index.html"; }
function formatINR(amount) { return amount.toLocaleString('en-IN'); }
function checkAuth(requiredRole) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) window.location.href = "index.html";
    if (requiredRole && user.role !== requiredRole) { alert("Access Denied!"); window.location.href = "index.html"; }
    return user;
}

function initTheme() {
    if(localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
}
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}
// --- TOAST NOTIFICATION ENGINE ---
// Create the container if it doesn't exist
if (!document.getElementById('toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
}

function showToast(message, type = 'default') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon logic
    let icon = "🔔";
    if (type === 'success') icon = "✅";
    if (type === 'warning') icon = "⚠️";

    toast.innerHTML = `${icon} &nbsp; ${message}`;
    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400); // Wait for fade out animation
    }, 3000);
}
// --- ELITE FEATURE: WEB AUDIO API SYNTHESIZER ---
// Generates sounds purely through math (no MP3 files required)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let soundEnabled = false;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

function playSound(type) {
    if (!soundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'bid') { // Soft pop for bids
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } 
    else if (type === 'urgent') { // Warning beep for < 10 seconds
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    }
    else if (type === 'sold') { // Chime for sold
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
    }
}

// --- ELITE FEATURE: PROXY BIDDING ENGINE (Auto-Pilot) ---
function runProxyBidders() {
    let auctions = JSON.parse(localStorage.getItem('auctions_v4')) || [];
    let updated = false;

    auctions.forEach(item => {
        if (Date.now() > item.endTime || !item.proxy) return; // Skip if ended or no proxy

        const currentHighest = item.bids[item.bids.length - 1];
        
        // If the current highest bidder is NOT the proxy owner, and proxy limit is not reached
        if (currentHighest.bidder !== item.proxy.bidder && currentHighest.amount < item.proxy.maxLimit) {
            let increment = item.basePrice > 1000000 ? 50000 : 10000;
            let nextBid = currentHighest.amount + increment;
            
            if (nextBid <= item.proxy.maxLimit) {
                item.bids.push({
                    bidder: item.proxy.bidder,
                    amount: nextBid,
                    timeStamp: Date.now()
                });
                updated = true;
            }
        }
    });

    if (updated) localStorage.setItem('auctions_v4', JSON.stringify(auctions));
}