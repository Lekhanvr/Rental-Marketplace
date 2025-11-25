// Debug functions to help troubleshoot data issues

function clearAllData() {
    localStorage.removeItem('userBookings');
    localStorage.removeItem('userNames');
    localStorage.removeItem('messages');
    localStorage.removeItem('notifications');
    console.log('All data cleared');
    alert('All data cleared. Please refresh and try again.');
}

function showStoredData() {
    console.log('=== STORED DATA DEBUG ===');
    console.log('User:', JSON.parse(localStorage.getItem('user') || 'null'));
    console.log('User Bookings:', JSON.parse(localStorage.getItem('userBookings') || '[]'));
    console.log('User Names:', JSON.parse(localStorage.getItem('userNames') || '{}'));
    console.log('Messages:', JSON.parse(localStorage.getItem('messages') || '[]'));
    console.log('Notifications:', JSON.parse(localStorage.getItem('notifications') || '[]'));
}

function createTestBooking() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login first');
        return;
    }
    
    const testBooking = {
        id: 'test_booking_' + Date.now(),
        item_id: 1,
        item_title: 'Test Item',
        start_date: '2025-01-15',
        end_date: '2025-01-20',
        rental_amount: 100,
        deposit_amount: 200,
        lender_id: 999, // Different from current user
        lender_name: 'Test Lender',
        borrower_id: user.id,
        borrower_name: user.name,
        status: 'pending',
        payment_method: 'cash_on_delivery',
        created_at: new Date().toISOString()
    };
    
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    bookings.push(testBooking);
    localStorage.setItem('userBookings', JSON.stringify(bookings));
    
    console.log('Test booking created:', testBooking);
    alert('Test booking created. Check dashboard.');
}

// Add to window for console access
window.clearAllData = clearAllData;
window.showStoredData = showStoredData;
window.createTestBooking = createTestBooking;