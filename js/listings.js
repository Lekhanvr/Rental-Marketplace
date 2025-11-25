let allItems = [];
let filteredItems = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    loadItems();
    setupSearchListener();
});

function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    const messagesLink = document.getElementById('messagesLink');
    const notificationsLink = document.getElementById('notificationsLink');
    const profileLink = document.getElementById('profileLink');
    
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (messagesLink) messagesLink.style.display = 'block';
        if (notificationsLink) notificationsLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'block';
        
        // Update badges
        updateMessageBadge();
        updateNotificationBadge();
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (messagesLink) messagesLink.style.display = 'none';
        if (notificationsLink) notificationsLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

function updateMessageBadge() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const unreadCount = messages.filter(m => 
        m.receiver_id === user.id && !m.is_read
    ).length;
    
    const badge = document.querySelector('#messagesLink .notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

function updateNotificationBadge() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const unreadCount = notifications.filter(n => 
        n.user_id === user.id && !n.is_read
    ).length;
    
    const badge = document.querySelector('#notificationsLink .notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    window.location.reload();
}

function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchItems();
        }
    });
}

async function loadItems() {
    try {
        allItems = await api.getItems();
        filteredItems = [...allItems];
        
        // Store user names for messaging
        const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
        allItems.forEach(item => {
            if (item.owner_name && item.user_id) {
                userNames[item.user_id] = item.owner_name;
            }
        });
        localStorage.setItem('userNames', JSON.stringify(userNames));
        localStorage.setItem('allItems', JSON.stringify(allItems));
        
        displayItems(filteredItems);
    } catch (error) {
        console.error('Error loading items:', error);
        document.getElementById('itemsContainer').innerHTML = 
            '<p style="text-align: center; color: var(--text-muted); padding: 3rem;">Error loading items. Please try again.</p>';
    }
}

function searchItems() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filteredItems = allItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category_name.toLowerCase().includes(query)
    );
    applyFilters();
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active tag
    document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'all') {
        filteredItems = [...allItems];
    } else {
        filteredItems = allItems.filter(item => item.category_name === category);
    }
    
    applyFilters();
}

function applyFilters() {
    let items = [...filteredItems];
    
    // Apply deposit filter
    const maxDeposit = document.getElementById('maxDeposit').value;
    if (maxDeposit) {
        items = items.filter(item => parseFloat(item.deposit_amount) <= parseFloat(maxDeposit));
    }
    
    // Apply price filter
    const maxPrice = document.getElementById('maxPrice').value;
    if (maxPrice) {
        items = items.filter(item => parseFloat(item.price_per_day) <= parseFloat(maxPrice));
    }
    
    // Apply sorting
    const sortBy = document.getElementById('sortBy').value;
    switch(sortBy) {
        case 'price_low':
            items.sort((a, b) => parseFloat(a.price_per_day) - parseFloat(b.price_per_day));
            break;
        case 'price_high':
            items.sort((a, b) => parseFloat(b.price_per_day) - parseFloat(a.price_per_day));
            break;
        case 'deposit_low':
            items.sort((a, b) => parseFloat(a.deposit_amount) - parseFloat(b.deposit_amount));
            break;
        default: // recent
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    displayItems(items);
}

function displayItems(items) {
    const container = document.getElementById('itemsContainer');
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 3rem;">No items available yet. Be the first to list an item!</p>';
        return;
    }
    
    // Group items by category
    const categories = {};
    items.forEach(item => {
        if (!categories[item.category_name]) {
            categories[item.category_name] = [];
        }
        categories[item.category_name].push(item);
    });
    
    let html = '';
    Object.keys(categories).forEach(categoryName => {
        html += `
            <h3 class="subheading">${categoryName}</h3>
            <div class="grid grid-3">
                ${categories[categoryName].map(item => createItemCard(item)).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function createItemCard(item) {
    const categoryClass = getCategoryClass(item.category_name);
    console.log('Item:', item.title, 'Image URL:', item.image_url);
    const imageStyle = item.image_url ? 
        `background-image: url('${item.image_url}'); background-size: cover; background-position: center;` : 
        `background-color: var(--bg-secondary);`;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = favorites.includes(item.id);
    
    return `
        <div class="listing-card" data-item-id="${item.id}">
            <div class="listing-img" style="${imageStyle}" onclick="viewItem(${item.id})"></div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${item.id})">
                ${isFavorite ? '❤️' : '🤍'}
            </button>
            <div class="listing-body" onclick="viewItem(${item.id})">
                <span class="badge">${item.category_name}</span>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="listing-meta">
                    <div>
                        <span class="price">₹${item.price_per_day}<span class="price-unit">/day</span></span>
                        <span class="deposit">Deposit: ₹${item.deposit_amount}</span>
                    </div>
                    <div class="rating">
                        <span>Owner: ${item.owner_name}</span>
                    </div>
                </div>
                <div class="listing-footer">
                    <span class="pill pill-${item.availability === 'available' ? 'success' : 'neutral'}">${item.availability}</span>
                    <span class="pill pill-neutral">${item.location || 'Campus'}</span>
                </div>
            </div>
        </div>
    `;
}

function getCategoryClass(categoryName) {
    switch(categoryName.toLowerCase()) {
        case 'books': return 'books-bg';
        case 'tools': return 'tools-bg';
        case 'costumes': return 'costumes-bg';
        default: return 'others-bg';
    }
}

function viewItem(itemId) {
    localStorage.setItem('selectedItemId', itemId);
    window.location.href = 'item.html';
}