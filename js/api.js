const API_BASE = 'http://localhost:3000/api';

const api = {
    async register(userData) {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    async login(credentials) {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return response.json();
    },

    async getItems(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE}/items?${params}`);
        return response.json();
    },

    async createItem(itemData) {
        const response = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });
        return response.json();
    },

    async createItemWithImage(formData) {
        const response = await fetch(`${API_BASE}/items/upload`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    },

    async getCategories() {
        const response = await fetch(`${API_BASE}/items/categories/all`);
        return response.json();
    },

    async getUserItems(userId) {
        const response = await fetch(`${API_BASE}/items/user/${userId}`);
        return response.json();
    },

    async getUserRentals(userId) {
        const response = await fetch(`${API_BASE}/rentals/user/${userId}`);
        return response.json();
    },

    async createRental(rentalData) {
        const response = await fetch(`${API_BASE}/rentals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rentalData)
        });
        return response.json();
    },

    async getItem(itemId) {
        const response = await fetch(`${API_BASE}/items/${itemId}`);
        return response.json();
    },

    async getRentalRequests(userId) {
        const response = await fetch(`${API_BASE}/rentals/requests/${userId}`);
        return response.json();
    },

    async updateRentalStatus(rentalId, status) {
        const response = await fetch(`${API_BASE}/rentals/${rentalId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return response.json();
    }
};