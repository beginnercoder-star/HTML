const el = document.getElementById('typedWord');

if (el){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const words = [
    "interior painting",
    "exterior painting",
    "cabinet refinishing",
    "commercial painting",
  ];

  if (prefersReducedMotion){
    // Just show the first word statically, no animation loop
    el.textContent = words[0];
  } else {
    const TYPE_SPEED = 65;
    const DELETE_SPEED = 40;
    const HOLD_TIME = 1400;
    const GAP_TIME = 300;

    let wordIndex = 0;
    let charIndex = 0;

    function typeStep(){
      const current = words[wordIndex];
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex < current.length){
        setTimeout(typeStep, TYPE_SPEED);
      } else {
        setTimeout(deleteStep, HOLD_TIME);
      }
    }

    function deleteStep(){
      const current = words[wordIndex];
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex > 0){
        setTimeout(deleteStep, DELETE_SPEED);
      } else {
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(typeStep, GAP_TIME);
      }
    }

    typeStep();
  }
}

// Nav menu toggle — present on every page, no guard needed
var navLinks = document.getElementById("navLinks");

function showMenu(){
  if (navLinks){
    navLinks.inert = false;
    navLinks.style.right = "0";
  }
  const btn = document.getElementById('menuToggle');
  if (btn) btn.setAttribute('aria-expanded', 'true');
}

function hideMenu(){
  if (navLinks){
    navLinks.style.right = "-200px";
    navLinks.inert = true;
  }
  const btn = document.getElementById('menuToggle');
  if (btn){
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }
}

function syncMenuInert(){
  if (!navLinks) return;
  const isDesktop = window.matchMedia('(min-width: 700px)').matches;
  navLinks.inert = isDesktop ? false : (navLinks.style.right !== '0px');
}

// Marquee — only runs on pages that actually have .marqueeTrack
const marqueeTrackForWidth = document.querySelector('.marqueeTrack');
const firstMarqueeSet = document.querySelector('.marqueeSet');

if (marqueeTrackForWidth && firstMarqueeSet) {

    function setMarqueeWidth() {
        marqueeTrackForWidth.style.setProperty(
            '--set-width',
            (firstMarqueeSet.offsetWidth + 20) + 'px'
        );
    }

    setMarqueeWidth();
    window.addEventListener('resize', setMarqueeWidth);
}


const marqueeTrack = document.querySelector('.marqueeTrack');

if (marqueeTrack) {

    marqueeTrack.addEventListener('click', () => {
        marqueeTrack.classList.toggle('isPaused');
    });

}

// Sync the inert state of the nav menu on window resize, and also run once on page load
window.addEventListener('resize', syncMenuInert);
syncMenuInert(); // run once on load

// Services carousel: arrows + dots + swipe sync, manual only, infinite loop
const carouselTrack = document.querySelector('.services');

if (carouselTrack){
  const carouselCards = document.querySelectorAll('.cardContainer');
  const carouselDots = document.querySelectorAll('.dotContainer .dot');
  const prevArrow = document.querySelector('.prevArrow');
  const nextArrow = document.querySelector('.nextArrow');
  let carouselIndex = 0;

  function goToServiceSlide(index){
    if (index < 0) index = carouselCards.length - 1;
    if (index >= carouselCards.length) index = 0;
    carouselCards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    carouselIndex = index;
  }

  if (prevArrow) prevArrow.addEventListener('click', () => goToServiceSlide(carouselIndex - 1));
  if (nextArrow) nextArrow.addEventListener('click', () => goToServiceSlide(carouselIndex + 1));

  carouselDots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToServiceSlide(i));
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        goToServiceSlide(i);
      }
    });
  });

  const carouselObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const idx = Array.from(carouselCards).indexOf(entry.target);
        carouselIndex = idx;
        carouselDots.forEach((d, i) => {
          const active = i === idx;
          d.classList.toggle('active', active);
          d.setAttribute('aria-selected', active ? 'true' : 'false');
          d.setAttribute('tabindex', active ? '0' : '-1');
        });
      }
    });
  }, { root: carouselTrack, threshold: 0.6 });

  carouselCards.forEach(card => carouselObserver.observe(card));
}

// Map — only runs on pages that actually have #serviceMap
const mapContainer = document.getElementById('serviceMap');

if (mapContainer){
  const areas = [
    { name: 'Las Vegas',        coords: [36.1699, -115.1398] },
    { name: 'Summerlin',        coords: [36.1716, -115.3286] },
    { name: 'North Las Vegas',  coords: [36.1989, -115.1175] },
    { name: 'Henderson',        coords: [36.0395, -114.9817] }
  ];
  const map = L.map('serviceMap', { scrollWheelZoom: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  async function drawAreaBoundary(placeName, color){
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&polygon_geojson=1&format=json&limit=5`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();

    const boundary = data.find(place =>
      place.geojson &&
      (place.geojson.type === 'Polygon' || place.geojson.type === 'MultiPolygon')
    );

    if (boundary){
      L.geoJSON(boundary.geojson, {
        style: {
          color: color,
          weight: 2,
          fillColor: '#a9a32f',
          fillOpacity: 0.22
        }
      }).addTo(map);
    } else {
      console.warn(`No polygon boundary found for "${placeName}"`);
    }
  }

  const areaNames = [
    'Las Vegas, NV',
    'Summerlin, Las Vegas, NV',
    'North Las Vegas, NV',
    'Henderson, NV'
  ];

  areaNames.forEach((name, i) => {
    setTimeout(() => drawAreaBoundary(name, '#b4843756'), i * 1100);
  });

  const pinIcon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#dbaa5c;border:2px solid #fff;box-shadow:0 0 0 3px rgba(219,170,92,0.35);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  areas.forEach(area => {
    L.marker(area.coords, { icon: pinIcon })
      .addTo(map)
      .bindPopup(area.name);
  });

  map.setView([36.15, -115.15], 10);

  map.on('click', () => map.scrollWheelZoom.enable());
}

// Quote form submission — only runs on pages with #quoteForm
const quoteForm = document.getElementById('quoteForm');

if (quoteForm){
  quoteForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('status');

    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';
    status.className = 'status';

    try {
      const response = await fetch('https://formspree.io/f/xrpznqbp', {
        method: 'POST',
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok){
        status.textContent = "Thanks! We'll be in touch shortly.";
        status.classList.add('ok');
        this.reset();
      } else {
        status.textContent = "Something went wrong. Please call or text us instead.";
        status.classList.add('error');
      }
    } catch (err){
      status.textContent = "Something went wrong. Please call or text us instead.";
      status.classList.add('error');
    }

    btn.disabled = false;
    btn.textContent = 'Send Request';
  });
}

// Before/After sliders — works for any number of .baSlider instances on the page
const baSliders = document.querySelectorAll('.baSlider');

if (baSliders.length){
  baSliders.forEach(slider => {
    const inner = slider.querySelector('.baSliderInner');
    const beforeWrap = slider.querySelector('.baBeforeWrap');
    const beforeImg = slider.querySelector('.baBefore');
    const handle = slider.querySelector('.baHandle');
    let dragging = false;

    function setPosition(percent){
      percent = Math.max(0, Math.min(100, percent));
      beforeWrap.style.width = percent + '%';
      handle.style.left = percent + '%';
      const sliderWidth = inner.offsetWidth;
      beforeImg.style.setProperty('--slider-img-width', sliderWidth + 'px');
      handle.setAttribute('aria-valuenow', Math.round(percent));
    }

    function moveFromEvent(clientX){
      const rect = inner.getBoundingClientRect();
      const percent = ((clientX - rect.left) / rect.width) * 100;
      setPosition(percent);
    }

    handle.addEventListener('pointerdown', (e) => {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
      if (dragging) moveFromEvent(e.clientX);
    });

    handle.addEventListener('pointerup', () => { dragging = false; });
    handle.addEventListener('pointercancel', () => { dragging = false; });

    // keyboard support: Left/Right arrows nudge the slider in 5% steps
    handle.addEventListener('keydown', (e) => {
      let current = parseFloat(beforeWrap.style.width) || 50;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown'){
        setPosition(current - 5);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp'){
        setPosition(current + 5);
        e.preventDefault();
      } else if (e.key === 'Home'){
        setPosition(0);
        e.preventDefault();
      } else if (e.key === 'End'){
        setPosition(100);
        e.preventDefault();
      }
    });

    // also allow clicking/tapping anywhere on the image to jump the slider there
    inner.addEventListener('click', (e) => {
      if (!dragging) moveFromEvent(e.clientX);
    });

    // initialize at 50%
    setPosition(50);
    window.addEventListener('resize', () => setPosition(parseFloat(beforeWrap.style.width) || 50));
  });
}

// Add a screen-reader-only hint to every gallery image link
document.querySelectorAll('.fullGalleryItem').forEach(link => {
  const hint = document.createElement('span');
  hint.className = 'sr-only';
  hint.textContent = ' (opens image preview)';
  link.appendChild(hint);
});
// Gallery filters — ARIA tabs pattern
const filterBtns = document.querySelectorAll('.filterBtn');

if (filterBtns.length){
  const tabs = Array.from(filterBtns);
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function activateTab(tab){
    tabs.forEach(t => {
      const selected = t === tab;
      t.classList.toggle('active', selected);
      t.setAttribute('aria-selected', selected);
      t.setAttribute('tabindex', selected ? '0' : '-1');
    });

    panels.forEach(panel => {
      panel.hidden = panel.id !== `panel-${tab.dataset.filter}`;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', (e) => {
      let newIndex;
      switch (e.key){
        case 'ArrowRight':
        case 'ArrowDown':
          newIndex = (index + 1) % tabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          newIndex = (index - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = tabs.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      tabs[newIndex].focus();
      activateTab(tabs[newIndex]);
    });
  });
}

// Lightbox — with focus management for keyboard/screen reader users
const lightbox = document.getElementById('lightbox');

if (lightbox){
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryLinks = document.querySelectorAll('.fullGalleryItem');
  let lastFocused = null;

  function openLightbox(link){
    lastFocused = document.activeElement;
    lightboxImg.src = link.getAttribute('href');
    lightboxImg.alt = link.querySelector('img').alt;
    lightbox.classList.add('open');
    lightboxClose.focus();
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    if (lastFocused) lastFocused.focus();
  }

  galleryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(link);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'Tab'){
      // only one focusable element inside (close button), so keep focus trapped there
      e.preventDefault();
      lightboxClose.focus();
    }
  });
}

// Show "specify other" field only when Service dropdown = Other
const serviceSelect = document.getElementById('service');

if (serviceSelect){
  const otherField = document.getElementById('otherServiceField');
  const otherInput = document.getElementById('otherService');

  serviceSelect.addEventListener('change', () => {
    if (serviceSelect.value === 'other'){
      otherField.style.display = 'block';
      otherInput.required = true;
    } else {
      otherField.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
    }
  });
}
// Show "specify other" field only when Service Area dropdown = Other
const areaSelect = document.getElementById('area');

if (areaSelect){
  const otherAreaField = document.getElementById('otherAreaField');
  const otherAreaInput = document.getElementById('otherArea');

  areaSelect.addEventListener('change', () => {
    if (areaSelect.value === 'other'){
      otherAreaField.style.display = 'block';
      otherAreaInput.required = true;
    } else {
      otherAreaField.style.display = 'none';
      otherAreaInput.required = false;
      otherAreaInput.value = '';
    }
  });
}