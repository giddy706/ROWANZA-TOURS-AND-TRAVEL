document.addEventListener('DOMContentLoaded', () => {
    initDestinationsDynamic();
});

function makeAbsoluteImage(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src;
    // Ensure relative paths starting with / work, or prepend / if missing
    return src.startsWith('/') ? src : '/' + src;
}

async function initDestinationsDynamic() {
    const containers = ['kenya-destinations-container', 'africa-destinations-container'];

    try {
        const data = await apiClient.getData();
        const locations = data.locations || [];

        const kenyaLocations = locations.filter(l => l.category === 'kenya');
        const africaLocations = locations.filter(l => l.category === 'africa');

        renderDestinations('kenya-destinations-container', kenyaLocations);
        renderDestinations('africa-destinations-container', africaLocations);

    } catch (err) {
        console.error('Error loading dynamic destinations:', err);
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full py-12 text-center bg-red-50 rounded-2xl border border-red-100">
                        <span class="iconify mx-auto mb-4 text-red-400" data-icon="solar:danger-triangle-linear" data-width="48"></span>
                        <h3 class="text-xl font-bold text-red-800 mb-2">Unable to connect to server</h3>
                        <p class="text-red-600 mb-6">We couldn't load the destinations. Please check if the server is running.</p>
                        <button onclick="initDestinationsDynamic()" class="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg">
                            Try Again
                        </button>
                    </div>
                `;
            }
        });
    }
}

function renderDestinations(containerId, locationsList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (locationsList.length === 0) {
        container.innerHTML = '<div class="col-span-full py-10 text-center text-gray-500 font-medium">No destinations found for this category.</div>';
        return;
    }

    const swiperIdsToInit = [];

    container.innerHTML = locationsList.map((dest, index) => {
        const hasMultipleImages = dest.images && dest.images.length > 1;
        const mainImage = dest.images && dest.images.length > 0 ? dest.images[0] : 'assets/images/placeholder.png';
        const mainImageUrl = makeAbsoluteImage(mainImage);
        const swiperId = `location-swiper-${containerId}-${dest.id}`; // Make ID unique per container

        // Generate Image HTML
        let imageHTML = '';
        if (hasMultipleImages) {
            swiperIdsToInit.push(swiperId); // Collect ID for later initialization
            const slides = dest.images.map(img => `
                <div class="swiper-slide">
                    <a href="tours.html?location=${encodeURIComponent(dest.title)}" class="block">
                        <img src="${makeAbsoluteImage(img)}" alt="${dest.title}" class="w-full h-[250px] object-cover rounded-2xl" />
                    </a>
                </div>
            `).join('');

            imageHTML = `
                <div id="${swiperId}" class="swiper location-image-swiper h-[250px] rounded-2xl">
                    <div class="swiper-wrapper">
                        ${slides}
                    </div>
                    <div class="swiper-pagination"></div>
                    <div class="swiper-button-next !w-8 !h-8 !bg-white/50 !rounded-full !text-black after:!text-sm backdrop-blur"></div>
                    <div class="swiper-button-prev !w-8 !h-8 !bg-white/50 !rounded-full !text-black after:!text-sm backdrop-blur"></div>
                </div>
            `;
        } else {
            imageHTML = `
                <a href="tours.html?location=${encodeURIComponent(dest.title)}" class="block">
                    <img src="${mainImageUrl}" alt="${dest.title}" class="w-full h-[250px] object-cover rounded-2xl" />
                </a>
            `;
        }

        return `
            <div class="items rounded-2xl flex flex-col h-full bg-white p-2 border border-light-grey shadow-sm hover:shadow-md transition">
                <div class="relative group rounded-2xl overflow-hidden block">
                    ${imageHTML}
                    ${!hasMultipleImages ? `
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-200 rounded-2xl pointer-events-none"
                        style="background: linear-gradient(0deg, #000 0%, rgba(0,0,0,0) 100%);"></div>
                    ` : ''}
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-10">
                        <a href="tours.html?location=${encodeURIComponent(dest.title)}"
                            class="pointer-events-auto border border-white text-white font-semibold p-4 rounded-[200px] transition duration-200 hover:bg-green-zomp hover:border-green-zomp bg-black/30 backdrop-blur-sm">
                            View Tours
                        </a>
                    </div>
                </div>
                <div class="mt-4 px-2 flex-grow flex flex-col">
                    <a href="tours.html?location=${encodeURIComponent(dest.title)}">
                        <h4 class="text-2xl text-darker-grey font-bold mb-1 transition duration-200 hover:text-green-zomp">
                            ${dest.title}</h4>
                    </a>
                    <p class="text-dark-grey text-sm mb-4 line-clamp-3 flex-grow">${dest.description}</p>
                    <div class="flex justify-between items-center mt-auto border-t border-light-grey pt-3">
                        <p class="text-green-zomp font-bold">From ${window.currencyManager ? window.currencyManager.formatPrice(dest.price) : '$' + dest.price}</p>
                        ${dest.tripType ? `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">${dest.tripType}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Initialize Swipers for location cards that have multiple images after HTML is rendered
    if (typeof Swiper !== 'undefined') {
        swiperIdsToInit.forEach(id => {
            const swiperElement = document.getElementById(id);
            if (swiperElement) {
                new Swiper(`#${id}`, {
                    slidesPerView: 1,
                    loop: true,
                    pagination: {
                        el: `#${id} .swiper-pagination`, // Target pagination within this specific swiper
                        clickable: true,
                    },
                    navigation: {
                        nextEl: `#${id} .swiper-button-next`, // Target navigation within this specific swiper
                        prevEl: `#${id} .swiper-button-prev`, // Target navigation within this specific swiper
                    },
                });
            }
        });
    }
}
