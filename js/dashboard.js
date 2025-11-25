// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCategories();
    loadDashboardData();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.name}`;
    
    // Show all authenticated user links
    const messagesLink = document.getElementById('messagesLink');
    const notificationsLink = document.getElementById('notificationsLink');
    const profileLink = document.getElementById('profileLink');
    
    if (messagesLink) messagesLink.style.display = 'block';
    if (notificationsLink) notificationsLink.style.display = 'block';
    if (profileLink) profileLink.style.display = 'block';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

async function loadCategories() {
    try {
        const categories = await api.getCategories();
        const select = document.getElementById('itemCategory');
        select.innerHTML = '<option value="">Select category</option>';
        categories.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        // Load user's items
        const items = await api.getUserItems(user.id);
        displayMyListings(items);
        
        // Load user's rentals
        const rentals = await api.getUserRentals(user.id);
        displayUserRentals(rentals);
        
        // Load rental requests from localStorage
        const allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const requests = allBookings.filter(booking => 
            booking.lender_id === user.id && booking.status === 'pending'
        );
        displayRentalRequests(requests);
        
        // Update stats
        updateDashboardStats(items, rentals, requests);
        
        // Update notification badges
        updateNotificationBadges();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function displayMyListings(items) {
    const container = document.getElementById('myListings');
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No items listed yet. Click "+ New Listing" to get started!</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="list-row">
            <div>
                <div class="list-title">${item.title}</div>
                <div class="list-meta">₹${item.price_per_day} / day · Deposit ₹${item.deposit_amount}</div>
            </div>
            <div>
                <span class="pill pill-${item.availability === 'available' ? 'success' : 'neutral'}">${item.availability}</span>
            </div>
        </div>
    `).join('');
}

function displayUserRentals(rentals) {
    const container = document.getElementById('yourRentalsSection');
    const borrowedRentals = rentals.filter(r => r.borrower_id == JSON.parse(localStorage.getItem('user')).id);
    
    if (borrowedRentals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No rentals yet.</p>';
        return;
    }
    
    container.innerHTML = borrowedRentals.map(rental => `
        <div class="list-row">
            <div>
                <div class="list-title">${rental.item_title}</div>
                <div class="list-meta">₹${rental.total_amount} · ${rental.start_date} to ${rental.end_date}</div>
            </div>
            <div>
                <span class="pill pill-${getStatusColor(rental.status)}">${rental.status}</span>
            </div>
        </div>
    `).join('');
}

function displayRentalRequests(requests) {
    const container = document.getElementById('rentalRequests');
    
    if (requests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No rental requests yet.</p>';
        return;
    }
    
    container.innerHTML = requests.map(request => {
        // Debug log to see what data we have
        console.log('Request data:', request);
        
        // Use borrower_name from booking data, fallback to 'Unknown User'
        const borrowerName = request.borrower_name || 'Unknown User';
        const totalAmount = (parseFloat(request.rental_amount) || 0) + (parseFloat(request.deposit_amount) || 0);
        
        console.log('Displaying borrower name:', borrowerName); // Debug log
        
        return `
            <div class="request-row">
                <div class="request-main">
                    <div class="request-title">${request.item_title}</div>
                    <div class="request-meta">
                        <span>From: <strong>${borrowerName}</strong></span>
                        <span>Dates: ${request.start_date} – ${request.end_date}</span>
                        <span>Total: ₹${totalAmount} (COD)</span>
                    </div>
                </div>
                <div class="request-actions">
                    <span class="pill pill-warning">Pending</span>
                    <div class="request-buttons">
                        <button class="btn btn-outline btn-sm" onclick="updateBookingStatus('${request.id}', 'rejected')">Reject</button>
                        <button class="btn btn-primary btn-sm" onclick="updateBookingStatus('${request.id}', 'approved')">Approve</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getBorrowerName(borrowerId) {
    // First check stored user names
    const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
    if (userNames[borrowerId]) {
        return userNames[borrowerId];
    }
    
    // Check if it's the current user
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.id == borrowerId) {
        return currentUser.name;
    }
    
    // Check all bookings for this user's name
    const allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const userBooking = allBookings.find(b => b.borrower_id == borrowerId && b.borrower_name);
    if (userBooking && userBooking.borrower_name) {
        // Store it for future use
        userNames[borrowerId] = userBooking.borrower_name;
        localStorage.setItem('userNames', JSON.stringify(userNames));
        return userBooking.borrower_name;
    }
    
    return `User ${borrowerId}`;
}

function updateDashboardStats(items, rentals, requests = []) {
    const user = JSON.parse(localStorage.getItem('user'));
    const activeListings = items.filter(item => item.availability === 'available').length;
    const userRentals = rentals.filter(r => r.borrower_id == user.id).length;
    const pendingRequests = requests.length; // requests are already filtered for pending
    
    document.getElementById('activeListings').textContent = activeListings;
    document.getElementById('yourRentals').textContent = userRentals;
    document.getElementById('pendingRequests').textContent = pendingRequests;
}

async function updateBookingStatus(bookingId, status) {
    try {
        // Update booking status in localStorage
        const allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updatedBookings = allBookings.map(booking => {
            if (booking.id === bookingId) {
                return { ...booking, status: status };
            }
            return booking;
        });
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        
        // Create notification for borrower
        const booking = allBookings.find(b => b.id === bookingId);
        if (booking) {
            const user = JSON.parse(localStorage.getItem('user'));
            await createNotification(
                booking.borrower_id, 
                `Rental Request ${status}`, 
                `Your request for ${booking.item_title} has been ${status} by ${user.name}`,
                `rental_${status}`
            );
        }
        
        alert(`Request ${status} successfully!`);
        loadDashboardData(); // Refresh the dashboard
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update request');
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'active': return 'success';
        case 'completed': return 'neutral';
        case 'cancelled': return 'neutral';
        default: return 'neutral';
    }
}

function showAddItemForm() {
    document.getElementById('addItemForm').style.display = 'block';
    setupImagePreview();
}

function setupImagePreview() {
    const imageInput = document.getElementById('itemImage');
    const preview = document.getElementById('imagePreview');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid var(--border-subtle);">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

function hideAddItemForm() {
    document.getElementById('addItemForm').style.display = 'none';
    document.getElementById('addItemForm').querySelector('form').reset();
}

async function addItem(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('category_id', document.getElementById('itemCategory').value);
    formData.append('title', document.getElementById('itemTitle').value);
    formData.append('description', document.getElementById('itemDescription').value);
    formData.append('price_per_day', document.getElementById('itemPrice').value);
    formData.append('deposit_amount', document.getElementById('itemDeposit').value);
    formData.append('location', document.getElementById('itemLocation').value);
    
    const imageFile = document.getElementById('itemImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
        console.log('Uploading image:', imageFile.name);
    }
    
    try {
        console.log('FormData contents:', Object.fromEntries(formData));
        const result = await api.createItemWithImage(formData);
        console.log('Upload result:', result);
        if (result.itemId) {
            alert('Item listed successfully!');
            hideAddItemForm();
            loadDashboardData();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item');
    }
}

async function createNotification(userId, title, message, type) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({
        id: Date.now(),
        user_id: userId,
        title: title,
        message: message,
        type: type,
        is_read: false,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function updateNotificationBadges() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Update message badge
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const unreadMessages = messages.filter(m => 
        m.receiver_id === user.id && !m.is_read
    ).length;
    
    const messageBadge = document.getElementById('messageBadge');
    if (messageBadge) {
        if (unreadMessages > 0) {
            messageBadge.textContent = unreadMessages;
            messageBadge.style.display = 'inline';
        } else {
            messageBadge.style.display = 'none';
        }
    }
    
    // Update notification badge
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const unreadNotifications = notifications.filter(n => 
        n.user_id === user.id && !n.is_read
    ).length;
    
    const notificationBadge = document.getElementById('notificationBadge');
    if (notificationBadge) {
        if (unreadNotifications > 0) {
            notificationBadge.textContent = unreadNotifications;
            notificationBadge.style.display = 'inline';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
}