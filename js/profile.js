document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProfile();
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

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    // Fill form with user data
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileCollege').value = user.college || '';

    // Set member since date (assuming created_at exists)
    if (user.created_at) {
        const date = new Date(user.created_at);
        document.getElementById('memberSince').textContent = date.toLocaleDateString();
    }

    // Load user stats
    loadUserStats(user.id);
}

async function loadUserStats(userId) {
    try {
        const items = await api.getUserItems(userId);
        const rentals = await api.getUserRentals(userId);
        
        document.getElementById('itemsListed').textContent = items.length;
        
        const completedRentals = rentals.filter(r => r.status === 'completed');
        document.getElementById('successfulRentals').textContent = completedRentals.length;
        
        // For now, show default rating
        document.getElementById('averageRating').textContent = '0.0★';
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const userData = {
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        college: document.getElementById('profileCollege').value
    };
    
    try {
        // For now, just update localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
}