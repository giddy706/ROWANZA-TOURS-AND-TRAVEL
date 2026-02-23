document.addEventListener('DOMContentLoaded', () => {
    initTourDetailsDynamic();
});

function makeAbsoluteImage(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src;
    // Ensure relative paths starting with / work, or prepend / if missing
    return src.startsWith('/') ? src : '/' + src;
}

async function initTourDetailsDynamic() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tourId = urlParams.get('id');

        if (!tourId) {
            console.error('No tour ID provided in URL');
            return;
        }

        const data = await apiClient.getData();
        const tours = data.tours || [];
        const tour = tours.find(t => String(t.id) === String(tourId));

        if (!tour) {
            console.error('Tour not found');
            return;
        }

        // Render data into the DOM
        const titleEl = document.getElementById('dynamic-tour-title');
        if (titleEl) titleEl.textContent = tour.title;

        const locationEl = document.getElementById('dynamic-tour-location');
        if (locationEl) locationEl.textContent = tour.location;

        const priceEl = document.getElementById('dynamic-tour-price');
        if (priceEl) priceEl.textContent = window.currencyManager ? window.currencyManager.formatPrice(tour.price) : '$' + tour.price;

        // Match location title with tour location
        const locations = data.locations || [];
        const relatedLocation = locations.find(l =>
            tour.location && l.title && tour.location.toLowerCase().includes(l.title.toLowerCase())
        );

        let galleryImages = [];
        if (tour.image) galleryImages.push(makeAbsoluteImage(tour.image));

        // Dynamic Gallery Generation
        const galleryContainer = document.getElementById('dynamic-gallery-container');
        if (galleryContainer) {
            if (relatedLocation && relatedLocation.images) {
                relatedLocation.images.forEach(img => {
                    const absImg = makeAbsoluteImage(img);
                    if (!galleryImages.includes(absImg)) {
                        galleryImages.push(absImg);
                    }
                });
            }

            if (galleryImages.length > 0) {
                let html = '';
                if (galleryImages.length === 1) {
                    html = `
                    <div class="col-span-12">
                        <a data-fancybox="gallery" href="${galleryImages[0]}" class="block w-full h-full">
                            <img src="${galleryImages[0]}" alt="${tour.title}" class="w-full h-[300px] md:h-[500px] object-cover rounded-xl" />
                        </a>
                    </div>`;
                } else if (galleryImages.length === 2) {
                    html = `
                    <div class="col-span-12 lg:col-span-8">
                        <a data-fancybox="gallery" href="${galleryImages[0]}" class="block w-full h-full">
                            <img src="${galleryImages[0]}" alt="Image 1" class="w-full h-[300px] md:h-[500px] object-cover rounded-xl" />
                        </a>
                    </div>
                    <div class="col-span-12 grid grid-cols-1 lg:col-span-4 gap-4">
                        <a data-fancybox="gallery" href="${galleryImages[1]}" class="block w-full h-full">
                            <img src="${galleryImages[1]}" alt="Image 2" class="w-full h-[200px] md:h-[500px] object-cover rounded-xl" />
                        </a>
                    </div>`;
                } else {
                    const galleryBtnHTML = galleryImages.length > 3 ? `
                        <button class="absolute bottom-3 right-3 bg-white text-black px-4 py-2.5 rounded-full font-semibold flex items-center gap-2 transition duration-200 hover:bg-green-zomp hover:text-white"
                            data-fancybox="gallery" data-src="${galleryImages[0]}">
                            <span class="iconify" data-icon="dashicons:grid-view" data-width="18" data-height="18"></span>
                            Gallery
                        </button>
                    ` : '';

                    let extraImagesHTML = '';
                    for (let i = 3; i < galleryImages.length; i++) {
                        extraImagesHTML += `<a data-fancybox="gallery" href="${galleryImages[i]}" style="display:none;"></a>`;
                    }

                    html = `
                    <div class="col-span-12 lg:col-span-8 h-[300px] lg:h-[400px]">
                        <a data-fancybox="gallery" href="${galleryImages[0]}" class="block w-full h-full">
                            <img src="${galleryImages[0]}" alt="Image 1" class="w-full h-full object-cover rounded-xl" />
                        </a>
                    </div>
                    <div class="col-span-12 grid grid-cols-2 lg:col-span-4 lg:flex lg:flex-col gap-4 h-[200px] lg:h-[400px]">
                        <a data-fancybox="gallery" href="${galleryImages[1]}" class="block w-full lg:h-[190px]">
                            <img src="${galleryImages[1]}" alt="Image 2" class="w-full h-full object-cover rounded-xl" />
                        </a>
                        <div class="relative lg:h-[190px]">
                            <a data-fancybox="gallery" href="${galleryImages[2]}" class="block w-full h-full">
                                <img src="${galleryImages[2]}" alt="Image 3" class="w-full h-full object-cover rounded-xl" />
                            </a>
                            ${galleryBtnHTML}
                        </div>
                    </div>
                    ${extraImagesHTML}
                    `;
                }
                galleryContainer.innerHTML = html;
            }
        }


        // --- Dynamic Detailed Sections ---
        if (relatedLocation) {

            // Reviews
            const reviewsContainer = document.getElementById('dynamic-reviews-container');
            if (reviewsContainer) {
                const reviews = relatedLocation.reviews || [];
                if (reviews.length > 0) {
                    reviewsContainer.innerHTML = reviews.map(r => `
                        <div class="mb-6 pb-6 border-b border-light-grey last:border-0 last:pb-0">
                            <div class="flex items-center gap-1 mb-2 text-orange-yellow">
                                ${Array(r.rating).fill('<span class="iconify" data-icon="mdi:star"></span>').join('')}
                            </div>
                            <h6 class="text-black font-bold mb-1">${r.name}</h6>
                            <p class="text-sm text-dark-grey mb-3">${r.date}</p>
                            <p class="text-dark-grey italic">"${r.comment}"</p>
                        </div>
                    `).join('');
                } else {
                    reviewsContainer.innerHTML = '<p class="text-dark-grey">No reviews yet for this location.</p>';
                }
            }

            // FAQs
            const faqsContainer = document.getElementById('dynamic-faqs-container');
            if (faqsContainer) {
                const faqs = relatedLocation.faqs || [];
                if (faqs.length > 0) {
                    faqsContainer.innerHTML = faqs.map((f, i) => `
                        <div class="faq-item mb-4 border border-light-grey rounded-xl overflow-hidden">
                            <button class="faq-toggle w-full flex items-center justify-between p-4 text-left bg-white hover:bg-light-grey transition-colors">
                                <span class="text-black font-bold">${f.question}</span>
                                <span class="iconify transform transition-transform duration-200" data-icon="ep:arrow-down-bold"></span>
                            </button>
                            <div class="faq-content hidden p-4 bg-[#f9fafa] border-t border-light-grey">
                                <p class="text-dark-grey">${f.answer}</p>
                            </div>
                        </div>
                    `).join('');

                    // Add FAQ toggle logic
                    faqsContainer.querySelectorAll('.faq-toggle').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const content = btn.nextElementSibling;
                            const icon = btn.querySelector('.iconify');
                            const isOpen = !content.classList.contains('hidden');

                            // Close all others
                            faqsContainer.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
                            faqsContainer.querySelectorAll('.iconify').forEach(i => i.classList.remove('rotate-180'));

                            if (!isOpen) {
                                content.classList.remove('hidden');
                                icon.classList.add('rotate-180');
                            }
                        });
                    });
                } else {
                    faqsContainer.innerHTML = '<p class="text-dark-grey">No FAQs yet for this location.</p>';
                }
            }
        }
        // Overview
        const overviewContent = document.getElementById('dynamic-overview-content');
        if (overviewContent && relatedLocation.overview) {
            overviewContent.innerHTML = `<p class="text-dark-grey">${relatedLocation.overview.replace(/\n/g, '<br>')}</p>`;
        }

        // What's Included
        const includedContent = document.getElementById('dynamic-included-content');
        if (includedContent && relatedLocation.included) {
            const lines = relatedLocation.included.split('\n').filter(l => l.trim());
            const half = Math.ceil(lines.length / 2);
            const leftCol = lines.slice(0, half);
            const rightCol = lines.slice(half);

            const renderList = (items, isNegative = false) => {
                return items.map(item => `
                        <li class="flex gap-2">
                            <span class="iconify ${isNegative ? 'text-[#FF0000]' : 'text-green-zomp'}"
                                  data-icon="${isNegative ? 'ic:sharp-clear' : 'ic:outline-check'}"
                                  data-width="20" data-height="20"></span>
                            <p>${item.trim().replace(/^•\s*/, '')}</p>
                        </li>
                    `).join('');
            };

            includedContent.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                        <ul class="text-dark-grey space-y-4">
                            ${renderList(leftCol)}
                        </ul>
                        <ul class="text-dark-grey space-y-4 mt-4 md:mt-0">
                            ${renderList(rightCol)}
                        </ul>
                    </div>
                `;
        }

        // Additional Info
        const additionalContent = document.getElementById('dynamic-additional-content');
        if (additionalContent && relatedLocation.additional) {
            const lines = relatedLocation.additional.split('\n').filter(l => l.trim());
            additionalContent.innerHTML = `
                    <ul class="list-disc marker:text-[#C0C5C9] text-dark-grey pl-5 mb-5 md:columns-2 gap-x-8 space-y-4">
                        ${lines.map(l => `<li>${l.trim().replace(/^•\s*/, '')}</li>`).join('')}
                    </ul>
                `;
        }

        // Cancellation Policy
        const cancellationContent = document.getElementById('dynamic-cancellation-content');
        if (cancellationContent && relatedLocation.cancellation) {
            const lines = relatedLocation.cancellation.split('\n').filter(l => l.trim());
            cancellationContent.innerHTML = `
                    <ul class="list-disc marker:text-[#C0C5C9] text-dark-grey pl-5 mb-5 md:columns-2 gap-x-8 space-y-4">
                        ${lines.map(l => `<li>${l.trim().replace(/^•\s*/, '')}</li>`).join('')}
                    </ul>
                `;
        }

        // What To Expect (Itinerary)
        const expectContent = document.getElementById('dynamic-expect-content');
        if (expectContent && relatedLocation.expect) {
            const days = relatedLocation.expect.split(/Day\s+\d+:?/i).filter(d => d.trim());
            expectContent.innerHTML = `
                    <div class="flex flex-col relative">
                        ${days.map((dayContent, index) => `
                            <div class="relative flex items-start md:before:content-[''] md:before:absolute md:before:top-11 md:before:left-[22px] md:before:w-px md:before:bg-green-zomp md:last:before:hidden md:before:h-full">
                                <div class="relative z-10">
                                    <div class="h-11 w-11 rounded-full border border-green-zomp bg-white hidden md:flex items-center justify-center text-green-zomp font-bold">
                                        ${index + 1}
                                    </div>
                                </div>
                                <div class="md:ml-6 flex-1 mb-8">
                                    <h6 class="text-black font-bold mb-2">Day ${index + 1}</h6>
                                    <p class="text-dark-grey">${dayContent.trim().replace(/\n/g, '<br>')}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
        }

        const durationEl = document.getElementById('dynamic-tour-duration');
        if (durationEl) durationEl.textContent = tour.duration;

        const typeEl = document.getElementById('dynamic-tour-type');
        if (typeEl) typeEl.textContent = tour.tripType;

        const descEl = document.getElementById('dynamic-tour-desc');
        if (descEl) descEl.textContent = tour.description;

        // Dynamic Map Update
        const mapIframe = document.getElementById('dynamic-map-iframe');
        if (mapIframe && tour.location) {
            const encodedLocation = encodeURIComponent(tour.location);
            mapIframe.src = `https://maps.google.com/maps?q=${encodedLocation}&t=m&z=10&output=embed&iwloc=near`;
            mapIframe.title = tour.location;
            mapIframe.ariaLabel = tour.location;
        }

        // Render Similar Experiences
        const similarContainer = document.getElementById('similar-tours-container');
        if (similarContainer) {
            // Get up to 6 tours in the same category or just any tours except the current one
            const similarTours = tours.filter(t => String(t.id) !== String(tourId)).slice(0, 6);

            similarContainer.innerHTML = similarTours.map(t => `
                <div class="swiper-slide">
                    <article class="relative overflow-hidden transition duration-200">
                        <div class="bg-white border rounded-2xl border-light-grey">
                            <div class="relative overflow-hidden rounded-t-2xl">
                                <a href="tours-details-style-01.html?id=${t.id}">
                                    <img src="${makeAbsoluteImage(t.image)}" alt="${t.title}" class="object-cover w-full h-48 transition duration-300 hover:scale-105">
                                    ${t.isTopSelling ? '<span class="absolute top-4 right-4 bg-orange-yellow rounded py-1 px-2 text-black text-sm font-semibold shadow-md">🔥 Top Selling</span>' : ''}
                                </a>
                            </div>
                            <div class="p-4">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="iconify" data-icon="ep:location" data-width="14" data-height="14"></span>
                                    <span class="text-sm text-dark-grey">${t.location}</span>
                                </div>
                                <h4 class="mb-2 text-base font-bold text-black transition duration-200 line-clamp-2 hover:text-green-zomp">
                                    <a href="tours-details-style-01.html?id=${t.id}">${t.title}</a>
                                </h4>
                                <div class="flex items-center mb-2 text-orange-yellow">
                                    ${Array(5).fill().map(() => `<span class="iconify" data-icon="mdi:star"></span>`).join('')}
                                    <span class="ml-2 text-dark-grey">(${t.reviews || 0} reviews)</span>
                                </div>
                                <div class="h-px my-4 border-t border-light-grey"></div>
                                <div class="flex items-center justify-between gap-2">
                                    <span class="flex items-center gap-1">
                                        <span>From</span>
                                        <span class="text-base font-bold text-green-zomp">${window.currencyManager ? window.currencyManager.formatPrice(t.price) : '$' + t.price}</span>
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <span class="iconify text-dark-grey" data-icon="fluent:clock-24-regular" data-width="15" data-height="15"></span>
                                        <div class="text-sm text-dark-grey">${t.duration}</div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            `).join('');

            // Re-initialize Swiper
            const swiperEl = document.querySelector('.tours-similar-swiper');
            if (swiperEl && swiperEl.swiper) {
                swiperEl.swiper.destroy(true, true);
            }
            if (typeof Swiper !== 'undefined') {
                new Swiper(".tours-similar-swiper", {
                    slidesPerView: 4,
                    spaceBetween: 24,
                    breakpoints: {
                        0: { slidesPerView: 1, spaceBetween: 12 },
                        768: { slidesPerView: 2, spaceBetween: 12 },
                        1024: { slidesPerView: 4, spaceBetween: 24 },
                    }
                });
            }
        }

        // --- Booking Form Logic ---
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            const adultInput = document.getElementById('adult');
            const childInput = document.getElementById('children');
            const extraCheckboxes = document.querySelectorAll('.dynamic-extra-checkbox');
            const totalDisplay = document.getElementById('booking-total-display');

            // Initial Price Displays
            const adultPriceDisplay = document.getElementById('adult-price-display');
            const childPriceDisplay = document.getElementById('child-price-display');
            const parkPriceDisplay = document.getElementById('extra-park-price');
            const wifiPriceDisplay = document.getElementById('extra-wifi-price');

            const adultPrice = tour.adultPrice || tour.price || 396;
            const childPrice = tour.childPrice || 320;
            const parkPrice = tour.parkPrice || 400;
            const wifiPrice = tour.wifiPrice || 60;

            if (adultPriceDisplay) adultPriceDisplay.textContent = (window.currencyManager ? window.currencyManager.formatPrice(adultPrice) : '$' + adultPrice);
            if (childPriceDisplay) childPriceDisplay.textContent = (window.currencyManager ? window.currencyManager.formatPrice(childPrice) : '$' + childPrice);
            if (parkPriceDisplay) parkPriceDisplay.textContent = (window.currencyManager ? window.currencyManager.formatPrice(parkPrice) : '$' + parkPrice);
            if (wifiPriceDisplay) wifiPriceDisplay.textContent = (window.currencyManager ? window.currencyManager.formatPrice(wifiPrice) : '$' + wifiPrice);

            const updateBookingTotal = () => {
                const adults = parseInt(adultInput?.value || 0, 10);
                const children = parseInt(childInput?.value || 0, 10);

                let total = (adults * adultPrice) + (children * childPrice);

                extraCheckboxes.forEach(cb => {
                    if (cb.checked) {
                        if (cb.id === 'extra-park') total += parkPrice;
                        if (cb.id === 'extra-wifi') total += wifiPrice;
                    }
                });

                if (totalDisplay) {
                    totalDisplay.textContent = window.currencyManager ? window.currencyManager.formatPrice(total) : '$' + total.toFixed(2);
                }
            };

            // Add listeners for real-time updates
            [adultInput, childInput].forEach(el => el?.addEventListener('input', updateBookingTotal));
            extraCheckboxes.forEach(cb => cb.addEventListener('change', updateBookingTotal));

            // Initial calc
            updateBookingTotal();

            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (window.cartManager) {
                    const adults = parseInt(adultInput?.value || 0, 10);
                    const children = parseInt(childInput?.value || 0, 10);
                    const selectedExtras = [];
                    extraCheckboxes.forEach(cb => {
                        if (cb.checked) selectedExtras.push(cb.id.replace('extra-', ''));
                    });

                    const checkIn = document.getElementById('check_in')?.value || '';
                    const checkOut = document.getElementById('check_out')?.value || '';

                    window.cartManager.clearCart();
                    window.cartManager.addItem({
                        id: tour.id,
                        title: tour.title,
                        price: tour.price, // Base price for reference
                        adults: adults,
                        children: children,
                        adultPrice: adultPrice,
                        childPrice: childPrice,
                        extras: selectedExtras,
                        extraPrices: { park: parkPrice, wifi: wifiPrice },
                        checkIn: checkIn,
                        checkOut: checkOut,
                        image: makeAbsoluteImage(tour.image),
                        location: tour.location,
                        duration: tour.duration,
                        quantity: 1 // We treat the whole booking as 1 cart item with multiple passengers
                    });

                    window.location.href = 'checkout.html';
                } else {
                    window.location.href = 'checkout.html?id=' + tour.id;
                }
            });
        }

        // Setup Review Form
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            let selectedRating = 5;
            const stars = document.querySelectorAll('.review-modal .iconify[data-icon="mdi:star"]');

            stars.forEach((star, index) => {
                star.style.cursor = 'pointer';
                star.addEventListener('click', () => {
                    selectedRating = index + 1;
                    // Update visual stars
                    stars.forEach((s, i) => {
                        s.classList.toggle('text-orange-yellow', i < selectedRating);
                        s.classList.toggle('text-gray-300', i >= selectedRating);
                    });
                });
            });

            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(reviewForm);
                const data = {
                    tourId: tour.id,
                    rating: selectedRating,
                    comment: formData.get('review'),
                    title: formData.get('review-title'),
                    userName: 'Client',
                    createdAt: new Date().toISOString()
                };

                const submitBtn = reviewForm.querySelector('button');
                const originalText = submitBtn.textContent;

                try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';

                    const reviewResponse = await window.apiClient.saveReview(data);

                    if (reviewResponse.success) {
                        alert('Thank you for your review!');
                        document.querySelector('.review-modal').classList.remove('active');
                        reviewForm.reset();
                        // Reload reviews to show the new one
                        if (typeof renderReviews === 'function') {
                            renderReviews(tour.id);
                        } else {
                            window.location.reload();
                        }
                    } else {
                        alert('Failed to save review.');
                    }
                } catch (err) {
                    console.error('Review error:', err);
                    alert('Error saving review.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        }

        // --- Setup Inquiry Form ---
        const inquiryForm = document.getElementById('inquiry-form-tour');
        if (inquiryForm) {
            inquiryForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(inquiryForm);
                const data = Object.fromEntries(formData.entries());
                data.subject = `Inquiry for Tour: ${tour.title} (ID: ${tour.id})`;

                const submitBtn = inquiryForm.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.textContent : 'Send enquiry';

                try {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Sending...';
                    }
                    const response = await window.apiClient.saveInquiry(data);
                    if (response.success) {
                        alert('Thank you! Your inquiry has been sent.');
                        inquiryForm.reset();
                    } else {
                        throw new Error('Failed to send inquiry');
                    }
                } catch (err) {
                    console.error('Inquiry error:', err);
                    alert('Error sending inquiry.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            });
        }

    } catch (err) {
        console.error('Error loading dynamic tour details:', err);
    }
}
