let currentRental = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadPendingReviews();
    loadUserReviews();
    setupStarRating();
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

async function loadPendingReviews() {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const rentals = await api.getUserRentals(user.id);
        const completedRentals = rentals.filter(r => 
            r.status === 'completed' && !r.reviewed
        );
        
        displayPendingReviews(completedRentals);
    } catch (error) {
        console.error('Error loading pending reviews:', error);
    }
}

function displayPendingReviews(rentals) {
    const container = document.getElementById('pendingReviews');
    
    if (rentals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No pending reviews.</p>';
        return;
    }
    
    container.innerHTML = rentals.map(rental => `
        <div class="list-row">
            <div>
                <div class="list-title">${rental.item_title}</div>
                <div class="list-meta">Rented from ${rental.lender_name} • ${rental.start_date} to ${rental.end_date}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openReviewModal(${rental.id})">Write Review</button>
        </div>
    `).join('');
}

async function loadUserReviews() {
    // For now, show placeholder
    const container = document.getElementById('yourReviews');
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No reviews yet.</p>';
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            updateStarRating(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', function() {
        const activeRating = document.querySelector('.star.active:last-of-type');
        const rating = activeRating ? parseInt(activeRating.dataset.rating) : 0;
        highlightStars(rating);
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#fbbf24';
        } else {
            star.style.color = '#374151';
        }
    });
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.remove('active');
        if (index < rating) {
            star.classList.add('active');
        }
    });
}

function openReviewModal(rentalId) {
    currentRental = rentalId;
    document.getElementById('reviewModal').style.display = 'flex';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentRental = null;
    document.getElementById('reviewText').value = '';
    updateStarRating(0);
}

async function submitReview(event) {
    event.preventDefault();
    
    const rating = document.querySelectorAll('.star.active').length;
    const reviewText = document.getElementById('reviewText').value;
    
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }
    
    try {
        // For now, just simulate success
        alert('Review submitted successfully!');
        closeReviewModal();
        loadPendingReviews();
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review');
    }
}