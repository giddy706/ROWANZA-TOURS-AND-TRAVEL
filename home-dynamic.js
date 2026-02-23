document.addEventListener('DOMContentLoaded', () => {
    initDynamicContent();
});

function makeAbsoluteImage(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src;
    // Ensure relative paths starting with / work, or prepend / if missing
    return src.startsWith('/') ? src : '/' + src;
}

async function initDynamicContent() {
    const containers = ['kenya-tours-container', 'africa-tours-container', 'testimonials-container', 'gallery-container'];

    try {
        const data = await apiClient.getData();
        renderKenyaTours(data.tours.filter(t => t.category === 'kenya'));
        renderAfricaTours(data.tours.filter(t => t.category === 'africa' || t.category === 'kenya'));
        renderTestimonials(data.testimonials);
        renderGallery(data.gallery);
        setupHomeSearch(data.locations);
    } catch (err) {
        console.error('Error initializing dynamic content:', err);
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <span class="iconify mx-auto mb-4 text-gray-400" data-icon="solar:server-square-broken" data-width="40"></span>
                        <h4 class="text-lg font-bold text-gray-700 mb-1">Server Connection Issue</h4>
                        <p class="text-sm text-gray-500 mb-6 px-4">We are having trouble connecting to the tour database. This often happens after your computer wakes up from sleep.</p>
                        <button onclick="initDynamicContent()" class="bg-green-zomp text-white px-8 py-3 rounded-full font-bold hover:bg-green-zomp-hover transition shadow-sm">
                            Try Reconnecting
                        </button>
                    </div>
                `;
            }
        });
    }
}

function renderKenyaTours(tours) {
    const container = document.getElementById('kenya-tours-container');
    if (!container) return;

    container.innerHTML = tours.map(tour => `
        <div class="swiper-slide group relative min-h-[400px] rounded-2xl overflow-hidden">
            <a href="tours-details-style-01.html?id=${tour.id}">
                <img src="${makeAbsoluteImage(tour.image)}" alt="${tour.title}" class="absolute inset-0 z-0 object-cover w-full h-full" />
            </a>
            ${tour.isTopSelling ? '<div class="absolute top-4 right-4 z-20 bg-orange-yellow text-black font-bold py-1 px-3 rounded-full text-sm shadow-lg">🔥 Top Selling</div>' : ''}
            <div class="absolute inset-0 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#00000008] before:to-[#000] before:z-[1] opacity-60"></div>
            
            <div class="absolute bottom-6 left-6 z-10 transition duration-200 group-hover:-translate-y-32">
                <div class="flex items-center gap-2 mb-1 text-white/90">
                    <span class="iconify" data-icon="ep:location" data-width="14" data-height="14"></span>
                    <span class="text-xs font-medium uppercase tracking-wider">${tour.location}</span>
                </div>
                <h2 class="text-white font-bold text-[28px] hover:text-green-zomp">
                    <a href="tours-details-style-01.html?id=${tour.id}">${tour.title}</a>
                </h2>
            </div>

            <div class="absolute z-10 transition-all duration-200 transform translate-y-6 opacity-0 bottom-6 left-6 right-6 group-hover:translate-y-0 group-hover:opacity-100">
                <p class="mb-4 text-white text-sm line-clamp-2">${tour.description}</p>
                <div class="mb-4 text-white font-bold text-lg">Starting from ${window.currencyManager ? window.currencyManager.formatPrice(tour.price) : '$' + tour.price}</div>
                <a href="tours-details-style-01.html?id=${tour.id}" class="border border-white text-sm text-white font-semibold py-3 px-4 rounded-[200px] transition duration-200 hover:bg-green-zomp hover:border-green-zomp">View Itinerary</a>
            </div>
        </div>
    `).join('');

    // Re-init Swiper if available
    if (typeof Swiper !== 'undefined') {
        new Swiper('.top-destination-swipper', {
            slidesPerView: 1,
            spaceBetween: 24,
            navigation: {
                nextEl: '.top-destination-next',
                prevEl: '.top-destination-prev',
            },
            pagination: {
                el: '.top-destination-pagination',
                clickable: true,
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 }
            }
        });
    }
}

function renderAfricaTours(tours) {
    const container = document.getElementById('africa-tours-container');
    if (!container) return;

    container.innerHTML = tours.map(tour => `
        <article class="relative overflow-hidden transition duration-200">
            <div class="bg-white border rounded-2xl border-light-grey h-full flex flex-col">
                <div class="relative overflow-hidden rounded-t-2xl">
                    <a href="tours-details-style-01.html?id=${tour.id}">
                        <img src="${makeAbsoluteImage(tour.image)}" alt="${tour.title}" class="object-cover w-full h-48 transition duration-300 hover:scale-105">
                        ${tour.isTopSelling ? '<span class="absolute top-4 right-4 bg-orange-yellow rounded py-1 px-2 text-black text-sm font-semibold shadow-md">🔥 Top Selling</span>' : ''}
                    </a>
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="iconify" data-icon="ep:location" data-width="14" data-height="14"></span>
                        <span class="text-sm text-dark-grey">${tour.location}</span>
                    </div>
                    <h4 class="mb-2 text-base font-bold text-black transition duration-200 line-clamp-2 hover:text-green-zomp">
                        <a href="tours-details-style-01.html?id=${tour.id}">${tour.title}</a>
                    </h4>
                    <div class="flex items-center mb-2 text-orange-yellow text-sm">
                        ${Array(5).fill().map(() => `<span class="iconify" data-icon="mdi:star"></span>`).join('')}
                        <span class="ml-2 text-dark-grey">(${tour.reviews} reviews)</span>
                    </div>
                    <div class="h-px my-4 border-t border-light-grey"></div>
                    <div class="flex items-center justify-between gap-2 mt-auto">
                        <span class="flex items-center gap-1">
                            <span>From</span>
                            <span class="text-base font-bold text-green-zomp">${window.currencyManager ? window.currencyManager.formatPrice(tour.price) : '$' + tour.price}</span>
                        </span>
                        <div class="flex items-center gap-2">
                            <button class="add-to-cart-btn p-2 bg-green-zomp text-white rounded-full hover:bg-green-zomp-hover transition" 
                                    data-tour='${JSON.stringify({ ...tour, image: makeAbsoluteImage(tour.image) })}'>
                                <span class="iconify" data-icon="ph:shopping-cart-simple-bold" data-width="20" data-height="20"></span>
                            </button>
                            <span class="flex items-center gap-0.5">
                                <span class="iconify text-dark-grey" data-icon="fluent:clock-24-regular" data-width="14" data-height="14"></span>
                                <div class="text-[12px] text-dark-grey">${tour.duration}</div>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    // Add event listeners for "Add to Cart" buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tour = JSON.parse(btn.getAttribute('data-tour'));
            if (window.cartManager) {
                window.cartManager.cart = [{
                    id: tour.id,
                    title: tour.title,
                    price: tour.price,
                    image: tour.image,
                    location: tour.location,
                    duration: tour.duration,
                    quantity: 1
                }];
                window.cartManager.saveCart();
                window.location.href = 'checkout.html';
            }
        });
    });
}

function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    container.innerHTML = testimonials.map(t => `
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-light-grey transition duration-300 hover:shadow-md">
            <div class="flex items-center gap-1 text-orange-yellow mb-4">
                ${Array(t.rating).fill().map(() => `<span class="iconify" data-icon="mdi:star"></span>`).join('')}
            </div>
            <p class="text-dark-grey italic mb-6">"${t.comment}"</p>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-green-zomp flex items-center justify-center text-white font-bold">
                    ${t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <h4 class="text-black font-bold">${t.name}</h4>
                    <p class="text-sm text-grey">Traveler from ${t.origin}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderGallery(gallery) {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = gallery.map(item => `
        <div class="swiper-slide">
            <img src="${item.image}" alt="${item.caption || 'Wildlife'}" class="object-cover w-full h-[300px]" />
        </div>
    `).join('');

    if (typeof Swiper !== 'undefined') {
        new Swiper('.gallerySwiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 6 }
            }
        });
    }
}

function setupHomeSearch(locations) {
    const locationSelect = document.getElementById('home-search-location');
    const searchBtn = document.getElementById('home-search-btn');

    if (locationSelect && locations) {
        locationSelect.innerHTML = '<option value="">Search a place or activity</option>' +
            locations.map(loc => `<option value="${loc.title}">${loc.title}</option>`).join('');
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const location = locationSelect ? locationSelect.value : '';
            if (location) {
                window.location.href = `tours.html?location=${encodeURIComponent(location)}`;
            } else {
                window.location.href = 'tours.html';
            }
        });
    }
}
