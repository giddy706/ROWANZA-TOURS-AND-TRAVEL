document.addEventListener("DOMContentLoaded", () => {
  // Accordion
  const accordions = document.querySelectorAll(".accordion-style");
  accordions.forEach((accordion) => {
    const items = accordion.querySelectorAll(".accordion-items");

    items.forEach((item, index) => {
      const title = item.querySelector(".accordion-title");
      const brief = item.querySelector(".accordion-brief");
      const icon = title.querySelector("[data-icon]");

      brief.style.overflow = "hidden";
      brief.style.transition = "height 0.3s ease";

      if (index === 0) {
        title.classList.add("active");
        brief.style.height = brief.scrollHeight + "px";
        icon.style.transform = "rotate(180deg)";
      } else {
        brief.style.height = "0px";
        icon.style.transform = "rotate(0deg)";
      }

      title.addEventListener("click", () => {
        const isActive = title.classList.contains("active");

        items.forEach((otherItem) => {
          const otherTitle = otherItem.querySelector(".accordion-title");
          const otherBrief = otherItem.querySelector(".accordion-brief");
          const otherIcon = otherTitle.querySelector("[data-icon]");

          if (otherItem === item) {
            if (!isActive) {
              otherTitle.classList.add("active");
              otherBrief.style.height = otherBrief.scrollHeight + "px";
              otherIcon.style.transform = "rotate(180deg)";
            } else {
              otherTitle.classList.remove("active");
              otherBrief.style.height = "0px";
              otherIcon.style.transform = "rotate(0deg)";
            }
          } else {
            otherTitle.classList.remove("active");
            otherBrief.style.height = "0px";
            otherIcon.style.transform = "rotate(0deg)";
          }
        });
      });
    });
  });

  // Quantity
  document.querySelectorAll('.quantity-group').forEach(group => {
    const input = group.querySelector('.quantity-input');
    const btnDecrement = group.querySelector('.btn-decrement');
    const btnIncrement = group.querySelector('.btn-increment');

    btnDecrement.addEventListener('click', () => {
      let current = parseInt(input.value) || 0;
      if (current > 0) {
        input.value = current - 1;
      }
    });

    btnIncrement.addEventListener('click', () => {
      let current = parseInt(input.value) || 0;
      input.value = current + 1;
    });
  });

  // Tabs content
  const tabContainers = document.querySelectorAll(".tabs-style");
  if (tabContainers) {
    tabContainers.forEach((container) => {
      const buttons = container.querySelectorAll(".tabs-btn");
      const contents = container.querySelectorAll(".tabs-brief");

      if (!buttons.length || !contents.length) return;

      const resetTabs = () => {
        buttons.forEach((btn) => btn.classList.remove("active"));
        contents.forEach((desc) => desc.classList.add("hidden"));
      };

      resetTabs();
      buttons[0].classList.add("active");
      contents[0].classList.remove("hidden");

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const target = button.getAttribute("data-tab");
          const contentToShow = container.querySelector(
            `.tabs-brief[data-content="${target}"]`
          );
          if (!contentToShow) return;

          resetTabs();
          button.classList.add("active");
          contentToShow.classList.remove("hidden");
        });
      });
    });
  }

  // Tabs image
  document.querySelectorAll('.tabs-wrapper').forEach(wrapper => {
    const btnsPanel = wrapper.querySelectorAll('.tabs-btn-panel');
    const imgsPanel = wrapper.querySelectorAll('.tabs-img-panel');

    if (btnsPanel.length && imgsPanel.length) {
      btnsPanel.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          btnsPanel.forEach(b => b.classList.remove('active'));
          imgsPanel.forEach(img => {
            img.classList.remove('active');
            img.classList.add('hidden');
          });

          btn.classList.add('active');
          imgsPanel[index].classList.add('active');
          imgsPanel[index].classList.remove('hidden');
        });
      });
    }
  });

  // Star review
  const stars = document.querySelectorAll("#your-rating .star-wrapper");
  if (stars) {
    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        const rating = index + 1;

        stars.forEach((s, i) => {
          const icon = s.querySelector(".iconify");
          if (i < rating) {
            s.classList.add("active");
            icon.setAttribute("data-icon", "tabler:star-filled");
            icon.classList.add("text-yellow-400");
          } else {
            s.classList.remove("active");
            icon.setAttribute("data-icon", "tabler:star");
            icon.classList.remove("text-yellow-400");
          }
        });
      });
    });
  }

  // Review modal
  const reviewModal = document.querySelector(".review-modal");
  const modalBox = reviewModal?.querySelector(".modal-box");
  const overlay = reviewModal?.querySelector(".overlay");
  const writeButtons = document.querySelectorAll(".write-review");
  const closeButtons = reviewModal?.querySelectorAll(".x-review-modal");

  if (reviewModal && modalBox && overlay) {
    writeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        reviewModal.classList.add("active");
        reviewModal.classList.remove("hidden");
      });
    });

    closeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        reviewModal.classList.remove("active");
        reviewModal.classList.add("hidden");
      });
    });

    overlay.addEventListener("click", () => {
      reviewModal.classList.remove("active");
      reviewModal.classList.add("hidden");
    });
  }

  // Filter width sidebar
    const destinationSelect = document.querySelector('.sidebar-filter select');
    const dateInput = document.getElementById('date_range');
    const clearSelectBtns = document.querySelectorAll('.clear-select');

    // Helper: Add selected item to sidebar result
    function addSelectedItem(type, value) {
      if (!filterSidebarResult) return;
      // Check if already exists
      let exists = false;
      Array.from(filterSidebarResult.children).forEach(li => {
        if (li.dataset.type === type && li.dataset.value === value) exists = true;
      });
      if (exists) return;
      const newLi = document.createElement('li');
      newLi.className = 'flex items-center px-2 py-1 bg-light-grey text-dark-grey rounded text-sm font-semibold';
      newLi.textContent = value;
      newLi.dataset.type = type;
      newLi.dataset.value = value;
      // Remove button
      const removeBtn = document.createElement('span');
      removeBtn.innerHTML = '<i class="iconify" data-icon="heroicons:x-mark"></i>';
      removeBtn.className = 'ml-2 font-bold cursor-pointer text-black-darkest';
      removeBtn.addEventListener('click', () => {
        newLi.remove();
        // Reset select/date if needed
        if (type === 'destination') {
          if (destinationSelect) destinationSelect.value = '0';
        }
        if (type === 'date') {
          if (dateInput) dateInput.value = '';
        }
        returnResult();
      });
      newLi.appendChild(removeBtn);
      filterSidebarResult.appendChild(newLi);
      returnResult();
    }

    // Listen select destination
    if (destinationSelect) {
      destinationSelect.addEventListener('change', function() {
        const value = this.value;
        const text = this.options[this.selectedIndex].text;
        // Do not add if All Destination
        if (value !== '0') {
          addSelectedItem('destination', text);
        } else {
          // Delete if All Destination
          Array.from(filterSidebarResult.children).forEach(li => {
            if (li.dataset.type === 'destination') li.remove();
          });
          returnResult();
        }
      });
    }

    // Listen date input
    if (dateInput) {
      dateInput.addEventListener('change', function() {
        if (this.value) {
          addSelectedItem('date', this.value);
        } else {
          // Remove clear date
          Array.from(filterSidebarResult.children).forEach(li => {
            if (li.dataset.type === 'date') li.remove();
          });
          returnResult();
        }
      });
    }

    // clear-select icon
    clearSelectBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const parent = btn.closest('.relative');
        if (parent) {
          const select = parent.querySelector('select');
          if (select) {
            select.value = '0';
            Array.from(filterSidebarResult.children).forEach(li => {
              if (li.dataset.type === 'destination') li.remove();
            });
            returnResult();
            return;
          }

          const input = parent.querySelector('input');
          if (input) {
            input.value = '';
            Array.from(filterSidebarResult.children).forEach(li => {
              if (li.dataset.type === 'date') li.remove();
            });
            returnResult();
            return;
          }
        }
      });
    });
  const filterSidebarCheckbox = document.querySelectorAll(".filter-sidebar-checkbox");
  const filterSidebarResult = document.getElementById("filter-sidebar-result");
  const selectedSidebarResults = document.getElementById("selected-sidebar-results");
  const resetButton = document.getElementById("filter-reset");

  const returnResult = () => {
    if (filterSidebarResult && filterSidebarResult.children.length > 0) {
      selectedSidebarResults.classList.remove("hidden");
    } else {
      selectedSidebarResults?.classList.add("hidden");
    }
  };

  if (filterSidebarCheckbox.length > 0 && filterSidebarResult) {
    filterSidebarCheckbox.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const value = e.target.value;
        if (e.target.checked) {
          const newLi = document.createElement("li");
          newLi.className = "flex items-center px-2 py-1 bg-light-grey text-dark-grey rounded text-sm font-semibold";
          newLi.textContent = value;

          // Add icon remove
          const removeBtn = document.createElement("span");
          removeBtn.innerHTML = '<i class="iconify" data-icon="heroicons:x-mark"></i>';
          removeBtn.className = "ml-2 font-bold cursor-pointer text-black-darkest";
          removeBtn.addEventListener("click", () => {
            // Remove checkbox
            e.target.checked = false;
            newLi.remove();
            returnResult();
          });

          newLi.appendChild(removeBtn);
          filterSidebarResult.appendChild(newLi);
        } else {
          // Remove <li> when unchecking
          Array.from(filterSidebarResult.children).forEach((li) => {
            if (li.textContent.includes(value)) {
              li.remove();
            }
          });
        }
        returnResult();
      });
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (filterSidebarResult) {
        filterSidebarResult.innerHTML = "";
      }
      filterSidebarCheckbox.forEach((checkbox) => {
        checkbox.checked = false;
      });
      returnResult();
    });
  }

  // Toggle sidebar filter mobile
  function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = `Status: ${message}`;
    }
  }

  function openSidebar() {
    const sidebarFilter = document.querySelector('.sidebar-filter');
    const overlayForSidebar = document.querySelector('.overlay-for-sidebar');

    if (sidebarFilter) {
      sidebarFilter.classList.add('active');
    } else {
      return;
    }

    if (overlayForSidebar) {
      overlayForSidebar.classList.add('active');
    }
  }
  function closeSidebar() {
    const sidebarFilter = document.querySelector('.sidebar-filter');
    const overlayForSidebar = document.querySelector('.overlay-for-sidebar');

    if (sidebarFilter) {
      sidebarFilter.classList.remove('active');
    } else {
      return;
    }

    if (overlayForSidebar) {
      overlayForSidebar.classList.remove('active');
    }
  }

  const filterButton = document.querySelector('.filter-button');

  if (filterButton) {
    filterButton.addEventListener('click', function (e) {
      e.preventDefault();
      openSidebar();
    });
  }

  const closeSidebarButton = document.querySelector('.close-sidebar-filter');
  if (closeSidebarButton) {
    closeSidebarButton.addEventListener('click', function (e) {
      e.preventDefault();
      closeSidebar();
    });
  }
  const overlayForSidebar = document.querySelector('.overlay-for-sidebar');
  if (overlayForSidebar) {
    overlayForSidebar.addEventListener('click', function (e) {
      closeSidebar();
    });
  }

  window.openSidebar = openSidebar;
  window.closeSidebar = closeSidebar;

  // Copy Link
  document.querySelectorAll('.btn-copy-link').forEach(button => {
    button.addEventListener('click', function () {
      const container = this.closest('div');
      const input = container.querySelector('.copy-input');

      input.select();
      input.setSelectionRange(0, 99999);

      navigator.clipboard.writeText(input.value).then(() => {
        this.textContent = 'Copied!';
        // setTimeout(() => this.textContent = 'Copy', 2000);
      });
    });
  });

  // scroll tours details page
  const navSection = document.getElementById("scroll-nav");
  const navLinks = navSection?.querySelectorAll("a");
  const overviewSection = document.getElementById("overview");
  const sections = [];

  if (navSection && navLinks && overviewSection) {
    navLinks.forEach(link => {
      const id = link.getAttribute("href")?.replace("#", "");
      const section = document.getElementById(id);
      if (section) sections.push({ id, el: section });
    });

    const navHeight = navSection.offsetHeight;

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const overviewTop = overviewSection.offsetTop;

      if (scrollY >= overviewTop - navHeight) {
        navSection.classList.remove("hidden");
        navSection.classList.add("fixed", "top-0", "left-0", "right-0", "z-50");
      } else {
        navSection.classList.add("hidden");
        navSection.classList.remove("fixed", "top-0", "left-0", "right-0", "z-50");
      }

      sections.forEach(({ id, el }) => {
        const sectionTop = el.offsetTop - navHeight - 10;
        const sectionBottom = sectionTop + el.offsetHeight;

        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          navLinks.forEach(link => link.classList.remove("active"));
          const activeLink = navSection.querySelector(`a[href="#${id}"]`);
          activeLink?.classList.add("active");
        }
      });
    });
  }

  // noUiSlider
  var sliderFilter = document.getElementById('slider_filter');

  if (sliderFilter && typeof noUiSlider !== 'undefined') {
    noUiSlider.create(sliderFilter, {
      start: [0, 40],
      connect: true,
      range: {
        'min': 0,
        'max': 40
      },
      step: 1,
      tooltips: true
    });

    var minPriceFilter = document.getElementById('minPrice_filter');
    var maxPriceFilter = document.getElementById('maxPrice_filter');

    sliderFilter.noUiSlider.on('update', function (values, handle) {
      if (handle === 0 && minPriceFilter) {
        minPriceFilter.innerHTML = Math.round(values[0]);
      } else if (maxPriceFilter) {
        maxPriceFilter.innerHTML = Math.round(values[1]);
      }
    });

    window.filterResults = function () {
      const priceRange = sliderFilter.noUiSlider.get();
      alert(`Filtering results for price range: ${priceRange[0]} - ${priceRange[1]}`);
    };
  }

  // Menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const closeMenuToggle = document.querySelector('.close-menu-toggle');
  const headerMenu = document.querySelector('.header-menu');
  const body = document.body;

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    headerMenu.classList.toggle('active');
    body.classList.toggle('active');
  }

  function closeMenu() {
    menuToggle.classList.remove('active');
    headerMenu.classList.remove('active');
    body.classList.remove('active');
  }

  menuToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  if (closeMenuToggle) {
    closeMenuToggle.addEventListener('click', function () {
      closeMenu();
    });
  }

  document.addEventListener('click', function (e) {
    if (
      headerMenu.classList.contains('active') &&
      !headerMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  const navFathers = document.querySelectorAll('.nav-father');

  navFathers.forEach(father => {
    father.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('active');
      const navMenu = this.querySelector('.nav-menu');
      if (navMenu) {
        navMenu.classList.toggle('active');
      }
    });
  });

  // Swiper custom
  new Swiper(".top-destination-swipper", {
    slidesPerView: 4,
    spaceBetween: 24,
    loop: true,
    navigation: {
      nextEl: ".top-destination-next",
      prevEl: ".top-destination-prev",
    },
    pagination: {
      el: ".top-destination-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 12,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 12,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    },
  });

  new Swiper(".destination-tours-swipper", {
    slidesPerView: 4,
    spaceBetween: 24,
    loop: true,
    navigation: {
      nextEl: ".destination-tours-next",
      prevEl: ".destination-tours-prev",
    },
    pagination: {
      el: ".destination-tours-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 12,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 12,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    },
  });

  new Swiper(".tours-similar-swiper", {
    slidesPerView: 4,
    spaceBetween: 24,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    },
  });

  new Swiper(".gallerySwiper", {
    slidesPerView: 8,
    spaceBetween: 0,
    loop: true,
    breakpoints: {
      0: {
        slidesPerView: 2,
        spaceBetween: 0,
      },
      640: {
        slidesPerView: 4,
        spaceBetween: 0,
      },
      768: {
        slidesPerView: 6,
        spaceBetween: 0,
      },
      1024: {
        slidesPerView: 8,
        spaceBetween: 0,
      },
    },
  });

  new Swiper(".blog-index-swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    // loop: true,
    pagination: {
      el: ".blog-index-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".blog-index-next",
      prevEl: ".blog-index-prev",
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 4 },
    },
  });

  new Swiper(".must-know-swiper", {
    slidesPerView: 3,
    spaceBetween: 28,
    loop: true,
    pagination: {
      el: ".must-know-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 28,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 28,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 28,
      },
    },
  });

  new Swiper(".places-visit-swiper", {
    slidesPerView: 2,
    spaceBetween: 24,
    // loop: true,
    navigation: {
      nextEl: ".places-visit-next",
      prevEl: ".places-visit-prev",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 24,
      },
      640: {
        slidesPerView: 1,
        spaceBetween: 24,
      },
      1024: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
    },
  });

  new Swiper(".blogs-swiper", {
    slidesPerView: 8,
    spaceBetween: 20,
    navigation: {
      nextEl: ".blogs-next",
      prevEl: ".blogs-prev",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        grid: {
          rows: 1,
          fill: "row",
        },
      },
      640: {
        slidesPerView: 2,
        grid: {
          rows: 1,
          fill: "row",
        },
      },
      768: {
        slidesPerView: 3,
        grid: {
          rows: 2,
          fill: "row",
        },
      },
      1024: {
        slidesPerView: 4,
        grid: {
          rows: 2,
          fill: "row",
        },
      },
      1280: {
        slidesPerView: 4,
        grid: {
          rows: 2,
          fill: "row",
        },
      },
    },
  });

  new Swiper(".blogs2st-swiper", {
    slidesPerView: 8,
    spaceBetween: 20,
    navigation: {
      nextEl: ".blogs2st-next",
      prevEl: ".blogs2st-prev",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        grid: {
          rows: 1,
          fill: "row",
        },
      },
      640: {
        slidesPerView: 2,
        grid: {
          rows: 1,
          fill: "row",
        },
      },
      768: {
        slidesPerView: 3,
        grid: {
          rows: 2,
          fill: "row",
        },
      },
      1024: {
        slidesPerView: 4,
        grid: {
          rows: 2,
          fill: "row",
        },
      },
      1280: {
        slidesPerView: 4,
        grid: {
          rows: 2,
          fill: "row",
        },
      },
    },
  });

  new Swiper(".related-products-swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: ".related-products-next",
      prevEl: ".related-products-prev",
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 4 },
    },
  });

  new Swiper(".interested-products-swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: ".interested-products-next",
      prevEl: ".interested-products-prev",
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 4 },
    },
  });

  new Swiper(".blogsdetails-swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    // loop: true,
    navigation: {
      nextEl: ".blogsdetails-next",
      prevEl: ".blogsdetails-prev",
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 4 },
    },
  });

  const thumbSwiper = new Swiper(".thumbSwiper", {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  });

  const mainSwiper = new Swiper(".mainSwiper", {
    spaceBetween: 10,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    thumbs: {
      swiper: thumbSwiper,
    },
  });

  const thumbSwiper02 = new Swiper(".thumbSwiper02", {
    direction: "vertical",
    spaceBetween: 12,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  });

  const mainSwiper02 = new Swiper(".mainSwiper02", {
    spaceBetween: 10,
    loop: true,
    thumbs: {
      swiper: thumbSwiper02,
    },
  });
});


var CommonComponents = (function ($) {
  'use strict';

  // Private methods
  function initFancybox() {
    if (typeof Fancybox !== 'undefined') {
      Fancybox.bind("[data-fancybox]", {});
    }
  }

  function initDaterangepicker() {
    if (!$.fn.daterangepicker) {
      console.warn('Daterangepicker plugin not found');
      return;
    }

    // Config single date picker
    var singleDateConfig = {
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: false,
      locale: {
        format: 'YYYY-MM-DD'
      }
    };

    // Config date range picker
    var dateRangeConfig = {
      autoUpdateInput: false,
      locale: {
        cancelLabel: 'Clear',
        format: 'YYYY-MM-DD'
      }
    };

    // check_in (single date)
    var $checkIn = $('#check_in');
    if ($checkIn.length > 0) {
      $checkIn.daterangepicker(singleDateConfig);
      $checkIn.on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD'));
      });
    }

    // check_out (single date)
    var $checkOut = $('#check_out');
    if ($checkOut.length > 0) {
      $checkOut.daterangepicker(singleDateConfig);
      $checkOut.on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD'));
      });
    }

    // date_range (range picker)
    var $dateRange = $('#date_range');
    if ($dateRange.length > 0) {
      $dateRange.daterangepicker(dateRangeConfig);

      $dateRange.on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
      });

      $dateRange.on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
      });
    }
  }

  // Public methods
  return {
    init: function () {
      initFancybox();
      initDaterangepicker();
    },

    // Call methods directly
    initFancybox: initFancybox,
    initDaterangepicker: initDaterangepicker,

    // Reinitialize datepicker
    reinitDatepicker: function (selector, type) {
      if (!$.fn.daterangepicker) return;

      var $element = $(selector);
      if ($element.length > 0) {
        var config;

        if (type === 'range') {
          // Config date range
          config = {
            autoUpdateInput: false,
            locale: {
              cancelLabel: 'Clear',
              format: 'YYYY-MM-DD'
            }
          };

          $element.daterangepicker(config);

          $element.on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
          });

          $element.on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
          });
        } else {
          // Config single date
          config = {
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: {
              format: 'YYYY-MM-DD'
            }
          };

          $element.daterangepicker(config);

          $element.on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD'));
          });
        }
      }
    }
  };

})(jQuery);

// DOM ready
$(document).ready(function () {
  CommonComponents.init();
});