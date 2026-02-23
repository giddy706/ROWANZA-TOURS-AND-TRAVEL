/**
 * CartManager - Manages the shopping cart using localStorage.
 */
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        window.cartManager = this;
    }

    loadCart() {
        const savedCart = localStorage.getItem('rowanza_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('rowanza_cart', JSON.stringify(this.cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: this.cart } }));
    }

    addItem(item) {
        // item expected: { id, title, price, image, location, duration }
        const existingItem = this.cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }
        this.saveCart();
        this.notify('Item added to cart!');
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(i => i.id !== itemId);
        this.saveCart();
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(i => i.id === itemId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(itemId);
            } else {
                this.saveCart();
            }
        }
    }

    getItems() {
        return this.cart;
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            const passengerTotal = (item.adults || 0) * (item.adultPrice || item.price || 0) +
                (item.children || 0) * (item.childPrice || 0);

            let extrasTotal = 0;
            if (item.extras && item.extraPrices) {
                item.extras.forEach(e => {
                    extrasTotal += (item.extraPrices[e] || 0);
                });
            }

            return total + ((passengerTotal + extrasTotal) * item.quantity);
        }, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    notify(message) {
        // Simple alert for now, can be upgraded to a toast
        alert(message);
    }
}

// Initialize the global CartManager
new CartManager();
