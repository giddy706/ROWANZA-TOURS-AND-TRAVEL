/**
 * Global Dynamic Content Handler
 * Handles dynamic site configuration like WhatsApp links, phone numbers, and emails.
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // We might already have apiClient from api-client.js
        if (!window.apiClient) {
            console.error('apiClient not found. Make sure api-client.js is loaded.');
            return;
        }

        const data = await window.apiClient.getData();
        const config = data.siteConfig;

        if (config) {
            updateWhatsAppLinks(config.whatsappNumber);
            updatePhoneLinks(config.contactPhone);
            updateEmailLinks(config.contactEmail);
        }
    } catch (err) {
        console.error('Error loading global dynamic content:', err);
    }
});

function updateWhatsAppLinks(number) {
    if (!number) return;

    // Clean number for wa.me link (remove +, spaces, etc.)
    const cleanNumber = number.replace(/\D/g, '');

    const links = document.querySelectorAll('.dynamic-whatsapp');
    links.forEach(link => {
        link.href = `https://wa.me/${cleanNumber}`;

        // Also update text if it's a number display
        const textElement = link.querySelector('.whatsapp-text') || (link.tagName === 'P' ? link : null);
        if (textElement) {
            // Check if it's a +254... format or similar
            if (textElement.textContent.includes('+') || /\d/.test(textElement.textContent)) {
                // Formatting for display (e.g., +254 717 446 976)
                // We'll keep it simple or use the formatted version if available
                // If it's just a number string, we'll try to format it
                textElement.textContent = formatDisplayNumber(number);
            }
        }
    });
}

function updatePhoneLinks(phone) {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const links = document.querySelectorAll('.dynamic-phone');
    links.forEach(link => {
        link.href = `tel:${cleanPhone}`;
        const textElement = link.querySelector('.phone-text') || link;
        if (textElement && (textElement.textContent.includes('07') || textElement.textContent.includes('+'))) {
            textElement.textContent = phone;
        }
    });
}

function updateEmailLinks(email) {
    if (!email) return;
    const links = document.querySelectorAll('.dynamic-email');
    links.forEach(link => {
        link.href = `mailto:${email}`;
        const textElement = link.querySelector('.email-text') || link;
        if (textElement && textElement.textContent.includes('@')) {
            textElement.textContent = email;
        }
    });
}

function formatDisplayNumber(num) {
    // Simple Kenyan format for now, or just return as is if already formatted
    if (num.startsWith('+')) return num;
    if (num.startsWith('254')) {
        return '+' + num.substring(0, 3) + ' ' + num.substring(3, 6) + ' ' + num.substring(6, 9) + ' ' + num.substring(9);
    }
    return num;
}
