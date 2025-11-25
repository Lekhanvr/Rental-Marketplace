// Load items on listings page
if (window.location.pathname.includes('listings.html')) {
    loadItems();
}

// Load nearby items on home page
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    updateNavigation();
    loadNearbyItems();
}

function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    const profileLink = document.getElementById('profileLink');
    
    if (user) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'block';
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    window.location.reload();
}

async function loadNearbyItems() {
    try {
        const items = await api.getItems();
        displayNearbyItems(items.slice(0, 2)); // Show only first 2 items
    } catch (error) {
        console.error('Error loading nearby items:', error);
    }
}

function displayNearbyItems(items) {
    const container = document.getElementById('nearbyItems');
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.85rem;">No items available yet. Be the first to list an item!</p>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        const categoryClass = getCategoryClass(item.category_name);
        return `
            <div class="mini-listing" onclick="viewItemFromHome(${item.id})">
                <div class="mini-listing-img ${categoryClass}"></div>
                <div class="mini-listing-body">
                    <h3>${item.title}</h3>
                    <p>₹${item.price_per_day} / day · ₹${item.deposit_amount} deposit</p>
                    <span class="badge badge-soft">${item.category_name}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getCategoryClass(categoryName) {
    switch(categoryName.toLowerCase()) {
        case 'books': return 'books-bg';
        case 'tools': return 'tools-bg';
        case 'costumes': return 'costumes-bg';
        default: return 'others-bg';
    }
}

function viewItemFromHome(itemId) {
    localStorage.setItem('selectedItemId', itemId);
    window.location.href = 'item.html';
}

async function loadItems() {
    try {
        const items = await api.getItems();
        displayItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function displayItems(items) {
    const container = document.querySelector('.items-grid') || document.body;
    container.innerHTML = items.map(item => `
        <div class="item-card">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="item-price">₹${item.price_per_day}/day</div>
            <div class="item-deposit">₹${item.deposit_amount} deposit</div>
            <span class="badge">${item.category_name}</span>
        </div>
    `).join('');
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    api.login({ email, password })
        .then(result => {
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                window.location.href = 'dashboard.html';
            } else {
                alert('Login failed: ' + result.error);
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed');
        });
}

// Signup form handler
function handleSignup(event) {
    event.preventDefault();
    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        college: document.getElementById('college').value
    };
    
    api.register(userData)
        .then(result => {
            if (result.userId) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert('Registration failed: ' + result.error);
            }
        })
        .catch(error => {
            console.error('Signup error:', error);
            alert('Registration failed');
        });
}