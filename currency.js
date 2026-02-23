const exchangeRates = {
    'USD': 1,
    'KES': 130
};

const currencySymbols = {
    'USD': '$',
    'KES': 'KSh '
};

const currencyManager = {
    getCurrency() {
        return localStorage.getItem('selectedCurrency') || 'KES';
    },

    setCurrency(currency) {
        if (exchangeRates[currency]) {
            localStorage.setItem('selectedCurrency', currency);
            window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency } }));
        }
    },

    formatPrice(amount) {
        const currency = this.getCurrency();
        const rate = exchangeRates[currency] || 1;
        const symbol = currencySymbols[currency] || '$';
        const converted = Math.round(amount * rate);

        if (currency === 'VND') {
            return `${converted.toLocaleString()}${symbol}`;
        }
        return `${symbol}${converted.toLocaleString()}`;
    },

    init() {
        // Initial setup for all currency sliders/selects
        document.addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT' && e.target.closest('.relative.flex.items-center.gap-1')) {
                const newCurrency = e.target.value;
                if (exchangeRates[newCurrency]) {
                    this.setCurrency(newCurrency);
                }
            }
        });

        // Sync dropdowns with saved currency
        const currentCurrency = this.getCurrency();
        document.querySelectorAll('select').forEach(select => {
            if (Array.from(select.options).some(opt => exchangeRates[opt.value])) {
                select.value = currentCurrency;
            }
        });

        // Listen for internal changes to sync all dropdowns
        window.addEventListener('currencyChange', (e) => {
            document.querySelectorAll('select').forEach(select => {
                if (Array.from(select.options).some(opt => exchangeRates[opt.value])) {
                    select.value = e.detail.currency;
                }
            });

            // Trigger a re-render if initialization functions are available
            if (typeof initDynamicContent === 'function') {
                initDynamicContent();
            }
            if (typeof initToursDynamic === 'function') {
                initToursDynamic();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    currencyManager.init();
});

window.currencyManager = currencyManager;
