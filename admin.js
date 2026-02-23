document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

async function loadAllData() {
    try {
        const data = await apiClient.getData();
        renderLocations(data.locations || []);
        renderTours(data.tours);
        renderTestimonials(data.testimonials);
        renderGallery(data.gallery);
        populateLocationDropdown(data.locations || []);
        fillConfig(data.siteConfig);

        const bookings = await apiClient.getBookings();
        renderBookings(bookings);

        const inquiries = await apiClient.getInquiries();
        renderInquiries(inquiries);

        // Remove any existing error messages if load succeeds
        const existingError = document.getElementById('admin-error-message');
        if (existingError) existingError.remove();

    } catch (err) {
        console.error('Error loading data:', err);
        showAdminError();
    }
}

function showAdminError() {
    // Only show error once
    if (document.getElementById('admin-error-message')) return;

    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'admin-error-message';
    errorDiv.className = 'col-span-full mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4';
    errorDiv.innerHTML = `
        <div class="flex items-center gap-4 text-red-800">
            <span class="iconify text-3xl" data-icon="solar:shield-warning-bold"></span>
            <div>
                <h4 class="font-bold">Server Unreachable</h4>
                <p class="text-sm opacity-90">The admin dashboard is having trouble connecting to the backend server. Please verify the server is running.</p>
            </div>
        </div>
        <button onclick="loadAllData()" class="whitespace-nowrap bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition shadow-sm">
            Reconnect Now
        </button>
    `;
    mainContent.prepend(errorDiv);
}

// --- Renderers ---

function renderLocations(locations) {
    const container = document.getElementById('locations-list');
    if (!container) return; // Might not be on the DOM yet during this step
    container.innerHTML = locations.map(loc => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center">
            <div class="relative w-24 h-20 rounded-xl overflow-hidden border">
                 <img src="${loc.images && loc.images.length > 0 ? loc.images[0] : 'assets/images/placeholder.png'}" class="w-full h-full object-cover">
                 ${loc.images && loc.images.length > 1 ? `<div class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded">+${loc.images.length - 1}</div>` : ''}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-[#322153]">${loc.title}</h4>
                <p class="text-sm text-gray-500">${loc.category} • Starting from $${loc.price}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editLocation('${loc.id}')" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><span class="iconify" data-icon="solar:pen-linear"></span></button>
                <button onclick="deleteLocation('${loc.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><span class="iconify" data-icon="solar:trash-bin-trash-linear"></span></button>
            </div>
        </div>
    `).join('');
}

function renderTours(tours) {
    const container = document.getElementById('tours-list');
    container.innerHTML = tours.map(tour => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center">
            <img src="${tour.image}" class="w-20 h-20 object-cover rounded-xl border">
            <div class="flex-1">
                <h4 class="font-bold text-[#322153]">${tour.title}</h4>
                <p class="text-sm text-gray-500">${tour.location} • $${tour.price}</p>
                <div class="text-[10px] text-gray-400">Adult: $${tour.adultPrice || tour.price} | Child: $${tour.childPrice || 0}</div>
                ${tour.isTopSelling ? '<span class="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Top Selling</span>' : ''}
            </div>
            <div class="flex gap-2">
                <button onclick="editTour('${tour.id}')" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><span class="iconify" data-icon="solar:pen-linear"></span></button>
                <button onclick="deleteTour('${tour.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><span class="iconify" data-icon="solar:trash-bin-trash-linear"></span></button>
            </div>
        </div>
    `).join('');
}

function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-list');
    container.innerHTML = testimonials.map(t => `
        <div class="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
            <div>
                <p class="italic text-gray-600 mb-2">"${t.comment}"</p>
                <p class="font-bold text-sm text-[#11A191]">${t.name} <span class="text-gray-400 font-normal">• ${t.origin}</span></p>
            </div>
            <button onclick="deleteTestimonial('${t.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><span class="iconify" data-icon="solar:trash-bin-trash-linear"></span></button>
        </div>
    `).join('');
}

function renderGallery(gallery) {
    const container = document.getElementById('gallery-list');
    container.innerHTML = gallery.map(item => `
        <div class="relative group rounded-2xl overflow-hidden border">
            <img src="${item.image}" class="w-full h-40 object-cover">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button onclick="deleteGallery('${item.id}')" class="bg-white/90 p-2 rounded-full text-red-500 hover:bg-white transition"><span class="iconify" data-icon="solar:trash-bin-trash-linear"></span></button>
            </div>
            ${item.caption ? `<p class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate">${item.caption}</p>` : ''}
        </div>
    `).join('');
}

function renderBookings(bookings) {
    const container = document.getElementById('bookings-list');
    if (!container) return;
    if (bookings.length === 0) {
        container.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-gray-500">No bookings found yet.</td></tr>';
        return;
    }
    container.innerHTML = [...bookings].reverse().map(b => {
        // Payment status badge
        const statusColor = b.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
            b.paymentStatus === 'Deposit Paid' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600';
        const statusText = b.paymentStatus || 'Pending';

        return `
        <tr class="border-b transition hover:bg-gray-50">
            <td class="px-6 py-4 text-xs font-mono text-gray-500">#${b.id.slice(-6)}</td>
            <td class="px-6 py-4">
                <div class="font-bold text-gray-900">${b.firstName} ${b.lastName}</div>
                <div class="text-xs text-gray-500">${b.emailAddress} | ${b.phone}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
                ${b.items ? b.items.map(item => `
                    <div class="mb-2">
                        <div class="font-bold">• ${item.title} (x${item.quantity})</div>
                        <div class="text-[10px] text-gray-400">
                            ${item.checkIn ? `In: ${item.checkIn} | ` : ''} 
                            ${item.checkOut ? `Out: ${item.checkOut}` : ''}
                        </div>
                    </div>
                `).join('') : 'No items'}
                ${b.orderNotes ? `<div class="mt-2 text-xs p-2 bg-blue-50 border border-blue-100 rounded text-blue-800"><strong>Note:</strong> ${b.orderNotes}</div>` : ''}
            </td>
            <td class="px-6 py-4 font-bold text-[#11A191]">${b.formattedTotal || 'KSh ' + (b.total || 0).toFixed(2)}</td>
            <td class="px-6 py-4 text-sm">
                ${b.paymentMethod === 'M-Pesa' ? `
                    <div class="flex items-center gap-1 mb-1">
                        <span class="iconify text-[#4CBB17]" data-icon="logos:mpesa" data-width="16"></span>
                        <span class="font-semibold text-[#2E7D32]">M-Pesa</span>
                    </div>
                    <div class="text-xs text-gray-500">${b.mpesaPhone || 'N/A'}</div>
                    <div class="text-xs text-gray-500 mt-1">${b.paymentType === 'deposit' ? 'Deposit (30%)' : 'Full Payment'}</div>
                    ${b.formattedAmountPaid ? `<div class="text-xs font-semibold text-[#4CBB17] mt-1">Paid: ${b.formattedAmountPaid}</div>` : ''}
                    ${b.remainingBalance > 0 ? `<div class="text-xs text-red-500">Balance: ${b.formattedRemainingBalance || 'KSh ' + b.remainingBalance.toFixed(2)}</div>` : ''}
                ` : `<span class="text-gray-400">Direct Booking</span>`}
            </td>
            <td class="px-6 py-4">
                <span class="text-xs font-bold px-3 py-1 rounded-full ${statusColor}">${statusText}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${new Date(b.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="booking-status.html?id=${b.id}" target="_blank" class="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition" title="View Status Page">
                        <span class="iconify" data-icon="solar:eye-linear" data-width="20"></span>
                    </a>
                    <button onclick="deleteBooking('${b.id}')" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition">
                        <span class="iconify" data-icon="solar:trash-bin-trash-linear" data-width="20"></span>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

async function deleteBooking(id) {
    if (!confirm('Permanently delete this booking?')) return;
    try {
        const res = await apiClient.deleteBooking(id);
        if (res.success) loadAllData();
    } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete booking');
    }
}

function renderInquiries(inquiries) {
    const container = document.getElementById('inquiries-list');
    if (!container) return;
    if (inquiries.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No inquiries found yet.</td></tr>';
        return;
    }
    container.innerHTML = [...inquiries].reverse().map(i => `
        <tr class="border-b transition hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-500">${new Date(i.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <div class="font-bold text-gray-900">${i.name}</div>
                <div class="text-xs text-gray-500">${i.email}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 whitespace-pre-wrap">${i.message || i.destination}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteInquiry('${i.id}')" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition">
                    <span class="iconify" data-icon="solar:trash-bin-trash-linear" data-width="20"></span>
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteInquiry(id) {
    if (!confirm('Permanently delete this inquiry?')) return;
    try {
        const res = await apiClient.deleteInquiry(id);
        if (res.success) loadAllData();
    } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete inquiry');
    }
}

function populateLocationDropdown(locations) {
    const dropdown = document.getElementById('tour-location');
    if (!dropdown) return;
    const currentVal = dropdown.value;
    dropdown.innerHTML = '<option value="">Select Location</option>' +
        locations.map(loc => `<option value="${loc.title}">${loc.title}</option>`).join('');
    if (currentVal) dropdown.value = currentVal;
}

function fillConfig(config) {
    document.getElementById('cfg-phone').value = config.contactPhone || '';
    document.getElementById('cfg-whatsapp').value = config.whatsappNumber || '';
    document.getElementById('cfg-email').value = config.contactEmail || '';
}

// --- Actions ---

async function saveTour() {
    const id = document.getElementById('tour-id').value;
    const tour = {
        title: document.getElementById('tour-title').value,
        location: document.getElementById('tour-location').value,
        price: parseFloat(document.getElementById('tour-price').value),
        duration: document.getElementById('tour-duration').value,
        category: document.getElementById('tour-category').value,
        isTopSelling: document.getElementById('tour-top').checked,
        description: document.getElementById('tour-desc').value,
        adultPrice: parseFloat(document.getElementById('tour-adult-price').value) || 0,
        childPrice: parseFloat(document.getElementById('tour-child-price').value) || 0,
        parkPrice: parseFloat(document.getElementById('tour-park-price').value) || 0,
        wifiPrice: parseFloat(document.getElementById('tour-wifi-price').value) || 0,
        reviews: 0
    };

    const formData = new FormData();
    formData.append('tour', JSON.stringify(tour));
    const imageFile = document.getElementById('tour-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        await apiClient.saveTour(formData, id);
        closeModal('tour');
        loadAllData();
    } catch (err) {
        alert('Error saving tour: ' + err.message);
    }
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function editTour(id) {
    const data = await apiClient.getData();
    const tour = data.tours.find(t => t.id === id);
    if (tour) {
        document.getElementById('tour-id').value = tour.id;
        document.getElementById('tour-title').value = tour.title;

        const locDropdown = document.getElementById('tour-location');
        // Try exact match first
        locDropdown.value = tour.location;
        // If not selected (value is still empty/default), try partial match
        if (locDropdown.selectedIndex <= 0 && tour.location) {
            const options = Array.from(locDropdown.options);
            const bestMatch = options.find(opt =>
                tour.location.toLowerCase().includes(opt.value.toLowerCase()) ||
                opt.value.toLowerCase().includes(tour.location.toLowerCase())
            );
            if (bestMatch) locDropdown.value = bestMatch.value;
        }

        document.getElementById('tour-price').value = tour.price;
        document.getElementById('tour-duration').value = tour.duration;
        document.getElementById('tour-category').value = tour.category;
        document.getElementById('tour-top').checked = tour.isTopSelling;
        document.getElementById('tour-desc').value = tour.description;
        document.getElementById('tour-adult-price').value = tour.adultPrice || tour.price;
        document.getElementById('tour-child-price').value = tour.childPrice || 0;
        document.getElementById('tour-park-price').value = tour.parkPrice || 0;
        document.getElementById('tour-wifi-price').value = tour.wifiPrice || 0;

        const preview = document.getElementById('tour-preview');
        preview.src = tour.image;
        preview.classList.remove('hidden');

        document.getElementById('tour-modal-title').innerText = 'Edit Tour Package';
        openModal('tour');
    }
}

async function deleteTour(id) {
    if (confirm('Are you sure you want to delete this tour?')) {
        await apiClient.deleteTour(id);
        loadAllData();
    }
}

// --- Locations Actions ---
let locationImagesToDelete = [];

async function saveLocation() {
    const id = document.getElementById('loc-id').value;
    const location = {
        title: document.getElementById('loc-title').value,
        category: document.getElementById('loc-category').value,
        price: parseFloat(document.getElementById('loc-price').value),
        description: document.getElementById('loc-desc').value,
        tripType: document.getElementById('loc-tripType').value,
        overview: document.getElementById('loc-overview').value,
        included: document.getElementById('loc-included').value,
        additional: document.getElementById('loc-additional').value,
        cancellation: document.getElementById('loc-cancellation').value,
        expect: document.getElementById('loc-expect').value
    };

    const formData = new FormData();
    formData.append('location', JSON.stringify(location));

    if (locationImagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(locationImagesToDelete));
    }

    const imageFiles = document.getElementById('loc-images').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        await apiClient.saveLocation(formData, id);
        closeModal('location');
        loadAllData();
    } catch (err) {
        alert('Error saving location: ' + err.message);
    }
}

function previewMultipleImages(input, previewContainerId) {
    const container = document.getElementById(previewContainerId);
    container.innerHTML = ''; // Clear for new selection
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-20 h-20 object-cover rounded-xl border';
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
        container.classList.remove('hidden');
    }
}

function removeLocationImage(imgSrc, containerId) {
    locationImagesToDelete.push(imgSrc);
    document.getElementById(containerId).remove();
}

async function editLocation(id) {
    const data = await apiClient.getData();
    const loc = data.locations.find(l => l.id === id);
    if (loc) {
        document.getElementById('loc-id').value = loc.id;
        document.getElementById('loc-title').value = loc.title;
        document.getElementById('loc-category').value = loc.category;
        document.getElementById('loc-price').value = loc.price;
        document.getElementById('loc-desc').value = loc.description;
        document.getElementById('loc-tripType').value = loc.tripType || 'Safari';
        document.getElementById('loc-overview').value = loc.overview || '';
        document.getElementById('loc-included').value = loc.included || '';
        document.getElementById('loc-additional').value = loc.additional || '';
        document.getElementById('loc-cancellation').value = loc.cancellation || '';
        document.getElementById('loc-expect').value = loc.expect || '';

        locationImagesToDelete = []; // Reset

        const previewContainer = document.getElementById('loc-existing-images');
        previewContainer.innerHTML = '';
        if (loc.images && loc.images.length > 0) {
            loc.images.forEach((imgSrc, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'relative inline-block mr-2 mb-2';
                wrapper.id = `loc-img-${index}`;

                const img = document.createElement('img');
                img.src = imgSrc;
                img.className = 'w-20 h-20 object-cover rounded-xl border';

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition';
                btn.innerHTML = '<span class="iconify" data-icon="ic:round-close" data-width="12"></span>';
                btn.onclick = () => removeLocationImage(imgSrc, wrapper.id);

                wrapper.appendChild(img);
                wrapper.appendChild(btn);
                previewContainer.appendChild(wrapper);
            });
            previewContainer.classList.remove('hidden');
        } else {
            previewContainer.classList.add('hidden');
        }

        document.getElementById('loc-preview').innerHTML = ''; // Clear new previews
        document.getElementById('loc-preview').classList.add('hidden');

        document.getElementById('location-modal-title').innerText = 'Edit Location';
        openModal('location');
    }
}

async function deleteLocation(id) {
    if (confirm('Are you sure you want to delete this location?')) {
        await apiClient.deleteLocation(id);
        loadAllData();
    }
}

async function saveTestimonial() {
    const testimonial = {
        name: document.getElementById('test-name').value,
        origin: document.getElementById('test-origin').value,
        comment: document.getElementById('test-comment').value,
        rating: 5
    };
    if (testimonial.name && testimonial.comment) {
        try {
            await apiClient.saveTestimonial(testimonial);
            closeModal('testimonial');
            loadAllData();
        } catch (err) {
            alert('Error saving testimonial: ' + err.message);
        }
    }
}

async function deleteTestimonial(id) {
    if (confirm('Delete this testimonial?')) {
        await apiClient.deleteTestimonial(id);
        loadAllData();
    }
}

async function uploadGallery() {
    const file = document.getElementById('gallery-file').files[0];
    const caption = document.getElementById('gallery-caption').value;
    if (file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', caption);
        await apiClient.uploadGallery(formData);
        closeModal('gallery');
        loadAllData();
    }
}

async function deleteGallery(id) {
    if (confirm('Delete this photo?')) {
        await apiClient.deleteGallery(id);
        loadAllData();
    }
}

async function saveConfig() {
    const config = {
        contactPhone: document.getElementById('cfg-phone').value,
        whatsappNumber: document.getElementById('cfg-whatsapp').value,
        contactEmail: document.getElementById('cfg-email').value
    };
    await apiClient.saveConfig(config);
    alert('Configuration saved!');
}
