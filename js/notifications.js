document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadNotifications();
    updateNotificationBadge();
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

async function loadNotifications() {
    try {
        // Simulate notifications for demo
        const notifications = generateSampleNotifications();
        displayNotifications(notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function generateSampleNotifications() {
    const user = JSON.parse(localStorage.getItem('user'));
    return [
        {
            id: 1,
            title: 'New Rental Request',
            message: 'Someone wants to rent your DBMS Textbook',
            type: 'rental_request',
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            id: 2,
            title: 'Request Approved',
            message: 'Your request for Electronics Kit has been approved',
            type: 'rental_approved',
            is_read: false,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
            id: 3,
            title: 'Return Reminder',
            message: 'Please return the borrowed item by tomorrow',
            type: 'general',
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
    ];
}

function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 3rem;">No notifications yet.</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.is_read ? '' : 'unread'}" onclick="markAsRead(${notification.id})">
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
            </div>
            <div class="notification-time">
                ${formatTimeAgo(notification.created_at)}
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function updateNotificationBadge() {
    const notifications = generateSampleNotifications();
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

function markAsRead(notificationId) {
    // Simulate marking as read
    console.log('Marking notification as read:', notificationId);
    setTimeout(() => {
        loadNotifications();
        updateNotificationBadge();
    }, 100);
}

function markAllAsRead() {
    // Simulate marking all as read
    alert('All notifications marked as read');
    loadNotifications();
    updateNotificationBadge();
}