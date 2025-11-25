// Theme management
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Update toggle button
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'light') {
        root.style.setProperty('--bg', '#ffffff');
        root.style.setProperty('--bg-soft', '#f8fafc');
        root.style.setProperty('--bg-softer', '#f1f5f9');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--border-subtle', '#e2e8f0');
        root.style.setProperty('--text-main', '#1e293b');
        root.style.setProperty('--text-muted', '#64748b');
        root.style.setProperty('--text-soft', '#94a3b8');
        document.body.style.background = 'linear-gradient(to bottom, #f8fafc, #e2e8f0)';
    } else {
        // Reset to dark theme (default)
        root.style.setProperty('--bg', '#050816');
        root.style.setProperty('--bg-soft', '#0f172a');
        root.style.setProperty('--bg-softer', '#020617');
        root.style.setProperty('--card-bg', '#020617');
        root.style.setProperty('--border-subtle', '#1f2937');
        root.style.setProperty('--text-main', '#f9fafb');
        root.style.setProperty('--text-muted', '#9ca3af');
        root.style.setProperty('--text-soft', '#6b7280');
        document.body.style.background = 'radial-gradient(circle at top, #111827 0, #020617 55%, #000 100%)';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
});

// Favorites functionality
async function toggleFavorite(itemId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login to add favorites');
        return;
    }
    
    try {
        // Simulate API call
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(itemId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            alert('Removed from favorites');
        } else {
            favorites.push(itemId);
            alert('Added to favorites');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoriteButton(itemId, index === -1);
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

function updateFavoriteButton(itemId, isFavorite) {
    const btn = document.querySelector(`[data-item-id="${itemId}"] .favorite-btn`);
    if (btn) {
        btn.classList.toggle('active', isFavorite);
        btn.innerHTML = isFavorite ? '❤️' : '🤍';
    }
}

// Enhanced search with debouncing
let searchTimeout;
function debounceSearch(func, delay) {
    return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Auto-save form data
function autoSaveForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem(`autosave_${formId}`, JSON.stringify(data));
        });
    });
    
    // Restore saved data
    const savedData = localStorage.getItem(`autosave_${formId}`);
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = data[key];
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--primary);
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}