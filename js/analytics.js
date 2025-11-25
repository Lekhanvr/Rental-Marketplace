document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadAnalytics();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

async function loadAnalytics() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
        // Load user's items and bookings for analytics
        const items = await api.getUserItems(user.id);
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const userBookings = bookings.filter(b => b.lender_id === user.id);
        
        // Calculate analytics
        const completedRentals = userBookings.filter(b => b.status === 'completed').length;
        const totalEarnings = userBookings.reduce((sum, booking) => {
            if (booking.status === 'completed') {
                return sum + (booking.rental_amount || 0);
            }
            return sum;
        }, 0);
        
        // Update display
        document.getElementById('totalEarnings').textContent = `₹${totalEarnings}`;
        document.getElementById('totalRentals').textContent = completedRentals;
        document.getElementById('avgRating').textContent = '4.5★';
        document.getElementById('activeItems').textContent = items.length;
        
        // Load popular items
        displayPopularItems(items);
        displayRecentActivity(userBookings);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function displayPopularItems(items) {
    const container = document.getElementById('popularItems');
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No items listed yet.</p>';
        return;
    }
    
    container.innerHTML = items.slice(0, 3).map(item => `
        <div class="analytics-item">
            <h4>${item.title}</h4>
            <p>₹${item.price_per_day}/day • ${item.category_name}</p>
            <span class="pill pill-${item.availability === 'available' ? 'success' : 'neutral'}">${item.availability}</span>
        </div>
    `).join('');
}

function displayRecentActivity(bookings) {
    const container = document.getElementById('recentActivity');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent activity.</p>';
        return;
    }
    
    const recentBookings = bookings.slice(0, 5);
    container.innerHTML = recentBookings.map(booking => `
        <div class="activity-item">
            <div class="activity-info">
                <h4>${booking.item_title}</h4>
                <p>Rented by User ${booking.borrower_id}</p>
                <small>${formatDate(booking.created_at)}</small>
            </div>
            <span class="pill pill-${getStatusColor(booking.status)}">${booking.status}</span>
        </div>
    `).join('');
}

function getStatusColor(status) {
    switch(status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'completed': return 'neutral';
        default: return 'neutral';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}