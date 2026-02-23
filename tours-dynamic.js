document.addEventListener('DOMContentLoaded', () => {
    initToursDynamic();
});

function makeAbsoluteImage(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src;
    // Ensure relative paths starting with / work, or prepend / if missing
    return src.startsWith('/') ? src : '/' + src;
}

async function initToursDynamic() {
    try {
        const data = await apiClient.getData();
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const tripType = urlParams.get('tripType');
        const locationQuery = urlParams.get('location');

        let tours = data.tours || [];

        // --- Populate Sidebar Filters ---
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter && data.locations) {
            // Keep "All Destinations" option
            locationFilter.innerHTML = '<option value="">All Destinations</option>' +
                data.locations.map(loc => `<option value="${loc.title}" ${locationQuery === loc.title ? 'selected' : ''}>${loc.title}</option>`).join('');

            // Add listener for sidebar filter
            locationFilter.addEventListener('change', () => {
                const val = locationFilter.value;
                if (val) {
                    window.location.href = `tours.html?location=${encodeURIComponent(val)}`;
                } else {
                    window.location.href = 'tours.html';
                }
            });
        }

        // --- Filtering Logic ---
        let filteredTours = tours;

        if (category) {
            filteredTours = filteredTours.filter(tour => tour.category === category);
            const titleEl = document.querySelector('h1.text-black');
            if (titleEl) {
                const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
                titleEl.textContent = categoryTitle + ' Tours';
            }
        }

        if (tripType) {
            filteredTours = filteredTours.filter(tour => tour.tripType === tripType);
            const titleEl = document.querySelector('h1.text-black');
            if (titleEl) {
                titleEl.textContent = tripType + ' Packages';
            }
        }

        if (locationQuery) {
            filteredTours = filteredTours.filter(t => t.location && t.location.toLowerCase().includes(locationQuery.toLowerCase()));
            const titleEl = document.querySelector('h1.text-black');
            if (titleEl) {
                titleEl.textContent = 'Tours in ' + locationQuery;
            }
        }

        renderTours(filteredTours);
    } catch (err) {
        console.error('Error loading dynamic tours:', err);
    }
}

function renderTours(tours) {
    const container = document.getElementById('tours-container');
    if (!container) return;

    if (tours.length === 0) {
        container.innerHTML = '<div class="col-span-full py-20 text-center text-gray-500 font-medium">No tour packages found for this category.</div>';
        return;
    }

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

                    <div class="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                        ${tour.description}
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
                             <span class="flex items-center gap-1">
                                <span class="iconify text-dark-grey" data-icon="fluent:clock-24-regular" data-width="15" data-height="15"></span>
                                <div class="text-sm text-dark-grey">${tour.duration}</div>
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
