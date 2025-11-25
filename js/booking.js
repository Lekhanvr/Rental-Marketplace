let currentRental = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadBookingDetails();
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

async function loadBookingDetails() {
    const rentalId = localStorage.getItem('pendingBookingRental');
    if (!rentalId) {
        document.getElementById('bookingSummary').innerHTML = 
            '<p style="color: var(--danger);">No booking found. <a href="listings.html">Browse items</a></p>';
        return;
    }

    try {
        // Get rental details from localStorage or API
        const rentalData = JSON.parse(localStorage.getItem('currentRentalData') || '{}');
        
        currentRental = {
            id: rentalId,
            item_title: rentalData.item_title || 'Item',
            start_date: rentalData.start_date,
            end_date: rentalData.end_date,
            rental_amount: rentalData.rental_amount || 0,
            deposit_amount: rentalData.deposit_amount || 0,
            lender_name: rentalData.lender_name || 'Lender',
            lender_id: rentalData.lender_id
        };

        displayBookingSummary(currentRental);
        calculateTotal(currentRental);
    } catch (error) {
        console.error('Error loading booking:', error);
    }
}

function displayBookingSummary(rental) {
    const days = Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24)) + 1;
    
    document.getElementById('bookingSummary').innerHTML = `
        <div class="booking-item">
            <h4>${rental.item_title}</h4>
            <p><strong>Lender:</strong> ${rental.lender_name}</p>
            <p><strong>Duration:</strong> ${rental.start_date} to ${rental.end_date} (${days} days)</p>
            <p><strong>Pickup:</strong> Contact lender for location</p>
            
            <div class="booking-contact">
                <button class="btn btn-outline btn-sm" onclick="openChat(${rental.lender_id})">
                    💬 Message Lender
                </button>
            </div>
        </div>
    `;
}

function calculateTotal(rental) {
    const rentalAmount = parseFloat(rental.rental_amount) || 0;
    const depositAmount = parseFloat(rental.deposit_amount) || 0;
    const totalAmount = rentalAmount + depositAmount;

    document.getElementById('rentalAmount').textContent = `₹${rentalAmount}`;
    document.getElementById('depositAmount').textContent = `₹${depositAmount}`;
    document.getElementById('totalAmount').textContent = `₹${totalAmount}`;
}

async function confirmBooking() {
    if (!currentRental) {
        alert('No booking details found');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.name) {
        alert('User information not found. Please login again.');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Current user for booking:', user); // Debug log
    
    try {
        document.getElementById('confirmButton').textContent = 'Confirming...';
        document.getElementById('confirmButton').disabled = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create notification for lender
        await createNotification(currentRental.lender_id, 'New Rental Request', 
            `${user.name} wants to rent your ${currentRental.item_title} (COD: ₹${parseFloat(currentRental.rental_amount) + parseFloat(currentRental.deposit_amount)})`, 'rental_request');

        // Store booking with proper ID and borrower name
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const newBooking = {
            ...currentRental,
            id: 'booking_' + Date.now(),
            borrower_id: user.id,
            borrower_name: user.name, // Ensure this is the actual user name
            status: 'pending',
            payment_method: 'cash_on_delivery',
            created_at: new Date().toISOString()
        };
        
        console.log('Creating booking with borrower name:', user.name); // Debug log
        bookings.push(newBooking);
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        
        // Store borrower name for display
        const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
        userNames[user.id] = user.name;
        // Also store lender name if available
        if (currentRental.lender_id && currentRental.lender_name) {
            userNames[currentRental.lender_id] = currentRental.lender_name;
        }
        localStorage.setItem('userNames', JSON.stringify(userNames));

        alert('Booking confirmed! The lender has been notified. You can message them to arrange pickup.');
        
        // Clean up
        localStorage.removeItem('pendingBookingRental');
        localStorage.removeItem('currentRentalData');
        
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Booking error:', error);
        alert('Booking failed. Please try again.');
        
        document.getElementById('confirmButton').textContent = 'Confirm Booking';
        document.getElementById('confirmButton').disabled = false;
    }
}

function openChat(userId) {
    // Store user name for messaging
    if (currentRental && currentRental.lender_name) {
        const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
        userNames[userId] = currentRental.lender_name;
        localStorage.setItem('userNames', JSON.stringify(userNames));
    }
    
    localStorage.setItem('openChatWith', userId);
    window.location.href = 'messages.html';
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