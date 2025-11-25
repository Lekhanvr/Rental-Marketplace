let currentItem = null;

document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    loadItemDetails();
    setupDateListeners();
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
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

async function loadItemDetails() {
    const itemId = localStorage.getItem('selectedItemId');
    if (!itemId) {
        document.getElementById('itemDetails').innerHTML = 
            '<p style="text-align: center; color: var(--text-muted); padding: 3rem;">No item selected. <a href="listings.html">Browse items</a></p>';
        return;
    }

    try {
        const item = await api.getItem(itemId);
        currentItem = item;
        displayItemDetails(item);
        updateCostSummary();
    } catch (error) {
        console.error('Error loading item:', error);
        document.getElementById('itemDetails').innerHTML = 
            '<p style="text-align: center; color: var(--text-muted); padding: 3rem;">Error loading item details.</p>';
    }
}

function displayItemDetails(item) {
    const categoryClass = getCategoryClass(item.category_name);
    const bannerStyle = item.image_url ? 
        `background-image: url('${item.image_url}'); background-size: cover; background-position: center;` : 
        '';
    
    document.getElementById('itemDetails').innerHTML = `
        <div class="item-banner ${item.image_url ? '' : categoryClass}" style="${bannerStyle}"></div>
        <div class="item-header">
            <div>
                <span class="badge">${item.category_name}</span>
                <h1>${item.title}</h1>
                <p class="item-subtitle">${item.description}</p>
            </div>
            <div class="rating rating-large">
                <span>Owner: ${item.owner_name}</span>
                <span class="rating-count">Rating: ${item.owner_rating || '0.0'}★</span>
            </div>
        </div>

        <div class="item-meta-row">
            <div>
                <span class="label">Rental price</span>
                <span class="value">₹${item.price_per_day} / day</span>
            </div>
            <div>
                <span class="label">Security deposit</span>
                <span class="value highlight">₹${item.deposit_amount} (refundable)</span>
            </div>
            <div>
                <span class="label">Status</span>
                <span class="value">${item.availability}</span>
            </div>
        </div>

        <h2 class="subheading">Description</h2>
        <p>${item.description}</p>

        <h2 class="subheading">Pickup location</h2>
        <p>${item.location || 'Campus pickup'}</p>

        <h2 class="subheading">Lender</h2>
        <div class="user-row">
            <div class="avatar">${item.owner_name.charAt(0).toUpperCase()}</div>
            <div>
                <div class="user-name">${item.owner_name}</div>
                <div class="user-meta">${item.owner_rating || '0.0'}★ · Lender</div>
            </div>
        </div>
    `;
    
    document.title = `${item.title} | CampusShare`;
    
    // Update deposit cost immediately
    document.getElementById('depositCost').textContent = `₹${item.deposit_amount}`;
}

function getCategoryClass(categoryName) {
    switch(categoryName.toLowerCase()) {
        case 'books': return 'books-bg';
        case 'tools': return 'tools-bg';
        case 'costumes': return 'costumes-bg';
        default: return 'others-bg';
    }
}

function setupDateListeners() {
    const fromDate = document.getElementById('from-date');
    const toDate = document.getElementById('to-date');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    fromDate.min = today;
    toDate.min = today;
    
    fromDate.addEventListener('change', function() {
        toDate.min = this.value;
        updateCostSummary();
    });
    
    toDate.addEventListener('change', updateCostSummary);
}

function updateCostSummary() {
    if (!currentItem) return;
    
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    
    if (fromDate && toDate) {
        const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;
        const rentalCost = days * parseFloat(currentItem.price_per_day);
        const depositCost = parseFloat(currentItem.deposit_amount);
        const totalCost = rentalCost + depositCost;
        
        document.getElementById('rentalCost').textContent = `₹${rentalCost}`;
        document.getElementById('totalCost').textContent = `₹${totalCost}`;
    }
}

async function createRentalRequest(event) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login to make a rental request');
        window.location.href = 'login.html';
        return;
    }
    
    if (!currentItem) {
        alert('Item details not loaded');
        return;
    }
    
    const rentalData = {
        item_id: currentItem.id,
        borrower_id: user.id,
        start_date: document.getElementById('from-date').value,
        end_date: document.getElementById('to-date').value
    };
    
    try {
        // Calculate rental days properly
        const startDate = new Date(rentalData.start_date);
        const endDate = new Date(rentalData.end_date);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Store rental data for booking confirmation
        const rentalBookingData = {
            item_id: currentItem.id,
            item_title: currentItem.title,
            start_date: rentalData.start_date,
            end_date: rentalData.end_date,
            rental_amount: days * parseFloat(currentItem.price_per_day),
            deposit_amount: parseFloat(currentItem.deposit_amount),
            lender_name: currentItem.owner_name,
            lender_id: currentItem.user_id,
            days: days
        };
        
        localStorage.setItem('pendingBookingRental', Date.now());
        localStorage.setItem('currentRentalData', JSON.stringify(rentalBookingData));
        
        // Redirect to booking confirmation
        window.location.href = 'booking.html';
    } catch (error) {
        console.error('Error creating rental request:', error);
        alert('Failed to send rental request');
    }
}