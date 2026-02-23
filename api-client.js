const API_URL = (function () {
    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        /^192\.168\./.test(window.location.hostname);

    // If we're on a local network but NOT on port 5000, assume the backend is on 5000
    if (isLocal && window.location.port !== '5000') {
        return `http://${window.location.hostname}:5000/api`;
    }
    return '/api';
})();

const apiClient = {
    async fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return res;
        } catch (err) {
            if (retries > 0) {
                console.warn(`Fetch failed for ${url}. Retrying in ${backoff}ms... (${retries} left)`, err);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw err;
        }
    },

    async getData() {
        try {
            const res = await this.fetchWithRetry(`${API_URL}/data`);
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch data after retries:', err);
            throw err;
        }
    },

    async saveConfig(config) {
        const res = await fetch(`${API_URL}/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        return await res.json();
    },

    async saveTour(formData, id) {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/tours/${id}` : `${API_URL}/tours`;
        const res = await fetch(url, {
            method: method,
            body: formData
        });
        return await res.json();
    },

    async deleteTour(id) {
        const res = await fetch(`${API_URL}/tours/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    async saveLocation(formData, id) {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/locations/${id}` : `${API_URL}/locations`;
        const res = await fetch(url, {
            method: method,
            body: formData
        });
        return await res.json();
    },

    async deleteLocation(id) {
        const res = await fetch(`${API_URL}/locations/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    async saveTestimonial(testimonial) {
        const res = await fetch(`${API_URL}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testimonial)
        });
        return await res.json();
    },

    async deleteTestimonial(id) {
        const res = await fetch(`${API_URL}/testimonials/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    async uploadGallery(formData) {
        const res = await fetch(`${API_URL}/gallery`, {
            method: 'POST',
            body: formData
        });
        return await res.json();
    },

    async deleteGallery(id) {
        const res = await fetch(`${API_URL}/gallery/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    async getBookings() {
        const res = await fetch(`${API_URL}/bookings`);
        return await res.json();
    },

    async getBookingById(id) {
        const res = await fetch(`${API_URL}/bookings/${id}`);
        return await res.json();
    },

    async payBalance(id, paymentData) {
        const res = await fetch(`${API_URL}/bookings/${id}/pay-balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        return await res.json();
    },

    async getInquiries() {
        const res = await fetch(`${API_URL}/inquiries`);
        return await res.json();
    },

    async saveInquiry(inquiry) {
        const res = await fetch(`${API_URL}/inquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inquiry)
        });
        return await res.json();
    },

    async saveReview(review) {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
        return await res.json();
    },

    async deleteBooking(id) {
        const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    async deleteInquiry(id) {
        const res = await fetch(`${API_URL}/inquiries/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    async checkout(orderData) {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return await res.json();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiClient;
} else {
    window.apiClient = apiClient;
}
