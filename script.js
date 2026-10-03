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

// Services dropdown in the nav — tap/click "Services" to open the list of service pages
const submenuToggle = document.querySelector('.submenuToggle');
const submenuItem = submenuToggle ? submenuToggle.closest('.hasSubmenu') : null;
 
function setSubmenu(open){
  if (!submenuToggle) return;
  submenuItem.classList.toggle('open', open);
  submenuToggle.setAttribute('aria-expanded', String(open));
}
 
if (submenuToggle){
  submenuToggle.addEventListener('click', () => {
    setSubmenu(submenuToggle.getAttribute('aria-expanded') !== 'true');
  });
 
  // tapping anywhere else closes it
  document.addEventListener('click', (e) => {
    if (!submenuItem.contains(e.target)) setSubmenu(false);
  });
 
  // Escape closes it and returns focus to the button
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && submenuToggle.getAttribute('aria-expanded') === 'true'){
      setSubmenu(false);
      submenuToggle.focus();
    }
  });
}

function syncMenuInert(){
  if (!navLinks) return;
  const isDesktop = window.matchMedia('(min-width: 700px)').matches;
  navLinks.inert = isDesktop ? false : (navLinks.style.right !== '0px');
}

// Marquee — only runs on pages that actually have .marqueeTrack
// =========================
// SLIDING REVIEWS
// =========================

const marqueeTrack = document.querySelector('.marqueeTrack');
const marqueeSets = document.querySelectorAll('.marqueeSet');

if (marqueeTrack && marqueeSets.length >= 2) {

    function setMarqueeWidth() {

        const firstSet = marqueeSets[0];

        const setWidth = firstSet.getBoundingClientRect().width;

        const trackStyle = window.getComputedStyle(marqueeTrack);

        const gap =
            parseFloat(trackStyle.columnGap) ||
            parseFloat(trackStyle.gap) ||
            0;

        marqueeTrack.style.setProperty(
            '--set-width',
            (setWidth + gap) + 'px'
        );
    }

    // Calculate after the page has rendered
    requestAnimationFrame(setMarqueeWidth);

    // Recalculate after everything loads
    window.addEventListener('load', setMarqueeWidth);

    // Recalculate if screen size changes
    window.addEventListener('resize', setMarqueeWidth);
}


/* Tap/click to pause on phones */
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
// Map — only runs on pages that actually have #serviceMap
const mapContainer = document.getElementById('serviceMap');

if (mapContainer){

  // Hand-traced outline of the Las Vegas valley (GeoJSON order: [lng, lat])
  const valleyGeoJson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-115.2945051,36.336629],[-115.2701755,36.3317291],[-115.2488871,36.3243788],[-115.2367223,36.3243788],
        [-115.215434,36.3170278],[-115.1880632,36.3145773],[-115.169816,36.3145773],[-115.1485277,36.3121268],
        [-115.1181157,36.3023237],[-115.0998685,36.2974218],[-115.0755389,36.2876169],[-115.045127,36.2851655],
        [-115.0268798,36.2876169],[-115.0055914,36.2802624],[-115.0086326,36.2680034],[-115.0268798,36.2655514],
        [-115.0378254,36.2627445],[-115.0347853,36.2541645],[-115.0241449,36.2541645],[-115.0226249,36.2271928],
        [-115.0347853,36.2198353],[-115.0499858,36.2198353],[-115.0393455,36.2149299],[-115.025665,36.2137035],
        [-115.0165447,36.2112507],[-115.0165447,36.1940785],[-115.0180647,36.1769027],[-115.0089444,36.1634047],
        [-115.025665,36.1474495],[-115.0211048,36.141312],[-115.0302251,36.1364017],[-115.0287051,36.1278079],
        [-115.0241449,36.1204411],[-115.0219282,36.1132781],[-115.0119527,36.097159],[-115.0097359,36.0846197],
        [-114.9826657,36.0859598],[-114.9705182,36.0859598],[-114.9535117,36.0859598],[-114.9413642,36.0682875],
        [-114.9389347,36.0525755],[-114.9413642,36.0368604],[-114.9316462,36.0290017],[-114.9127942,35.9995244],
        [-114.9152237,35.9837987],[-114.9504036,35.9873899],[-114.9746986,35.9814923],[-114.9989936,35.9795263],
        [-115.0087116,36.0050803],[-115.0232886,36.0168717],[-115.0378655,36.0129414],[-115.054872,35.9972184],
        [-115.0718785,35.9873899],[-115.0670195,35.9716618],[-115.06459,35.9500305],[-115.0718785,35.934295],
        [-115.084026,35.9185563],[-115.1058915,35.9205238],[-115.1253275,35.9205238],[-115.1423339,35.9283933],
        [-115.1593404,35.9441301],[-115.1763469,35.9539639],[-115.1982124,35.9637966],[-115.2103599,35.9716618],
        [-115.2200779,35.9775602],[-115.2395138,35.9873899],[-115.2468023,35.9775602],[-115.2710973,35.9913215],
        [-115.2832448,35.9972184],[-115.3002513,35.9932872],[-115.3051103,36.0031149],[-115.3148283,36.0149066],
        [-115.3269758,36.0286613],[-115.3196873,36.0365201],[-115.3123988,36.0522353],[-115.3269758,36.0699111],
        [-115.3294053,36.0856196],[-115.3294053,36.099362],[-115.34604,36.1034976],[-115.3549972,36.1107342],
        [-115.3562768,36.1252056],[-115.3601156,36.136574],[-115.371548,36.155106],[-115.384344,36.164404],
        [-115.384344,36.1747339],[-115.384344,36.1850624],[-115.3805052,36.1953895],[-115.3652406,36.2087398],
        [-115.3524446,36.2181473],[-115.3460466,36.2305345],[-115.344767,36.2418876],[-115.3370894,36.2573666],
        [-115.3370894,36.2656208],[-115.3422078,36.2738741],[-115.3433539,36.3001442],[-115.3343967,36.3114873],
        [-115.3254396,36.3259215],[-115.3088048,36.3351993],[-115.2945051,36.336629]
      ]]
    }
  };

  const areas = [
    { key: 'lasvegas',  name: 'Las Vegas',       coords: [36.1699, -115.1398], local: true },
    { key: 'summerlin', name: 'Summerlin',       coords: [36.1716, -115.3286], query: 'Summerlin, Las Vegas, NV' },
    { key: 'northlv',   name: 'North Las Vegas', coords: [36.1989, -115.1175], query: 'North Las Vegas, NV' },
    { key: 'henderson', name: 'Henderson',       coords: [36.0395, -114.9817], query: 'Henderson, NV' }
  ];

  const baseStyle = { weight: 0, opacity: 0, fillOpacity: 0 };
  const highlightStyle = { color: '#dbaa5c', weight: 3, opacity: 1, fillColor: '#dbaa5c', fillOpacity: 0.12 };
  const boundaryLayers = {};
  let selectedKey = null;

  const map = L.map('serviceMap', { scrollWheelZoom: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  async function drawAreaBoundary(area){
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(area.query)}&polygon_geojson=1&format=json&limit=5`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();

      const boundary = data.find(place =>
        place.geojson &&
        (place.geojson.type === 'Polygon' || place.geojson.type === 'MultiPolygon')
      );

      if (boundary){
        boundaryLayers[area.key] = L.geoJSON(boundary.geojson, { style: baseStyle }).addTo(map);
        if (selectedKey === area.key) selectArea(area.key); // clicked before it finished loading
      } else {
        console.warn(`No polygon boundary found for "${area.query}"`);
      }
    } catch (err){
      console.warn(`Could not load boundary for "${area.query}"`, err);
    }
  }

  let queued = 0;
  areas.forEach(area => {
    if (area.local){
      // your hand-traced valley outline: draws instantly, no Nominatim request
      boundaryLayers[area.key] = L.geoJSON(valleyGeoJson, { style: baseStyle, interactive: false }).addTo(map);
    } else {
      setTimeout(() => drawAreaBoundary(area), queued++ * 1100);
    }
  });

  const pinIcon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#dbaa5c;border:2px solid #fff;box-shadow:0 0 0 3px rgba(219,170,92,0.35);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  areas.forEach(area => {
    L.marker(area.coords, { icon: pinIcon }).addTo(map).bindPopup(area.name);
  });

  map.setView([36.15, -115.15], 10);
  map.on('click', () => map.scrollWheelZoom.enable());

  // ---- Highlight an area (used by the footer links and the list under the map) ----
  const areaButtons = document.querySelectorAll('[data-area]');

  function selectArea(key){
    selectedKey = key;

    Object.entries(boundaryLayers).forEach(([k, layer]) => {
      layer.setStyle(k === key ? highlightStyle : baseStyle);
    });

    const layer = boundaryLayers[key];
    if (layer){
      layer.bringToFront();
      map.flyToBounds(layer.getBounds(), { padding: [20, 20] });
    } else {
      map.flyTo(areas.find(a => a.key === key).coords, 11);
    }

    areaButtons.forEach(b => {
      const on = b.dataset.area === key;
      if (b.tagName === 'BUTTON'){
        b.setAttribute('aria-pressed', String(on));
      } else if (on){
        b.setAttribute('aria-current', 'true');
      } else {
        b.removeAttribute('aria-current');
      }
    });
  }

  areaButtons.forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.tagName === 'A') e.preventDefault(); // stay on this page, just highlight
      selectArea(el.dataset.area);
      if (el.closest('footer')){
        document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Arriving from another page via index.html?area=summerlin#map
  const startArea = new URLSearchParams(window.location.search).get('area');
  if (startArea && areas.some(a => a.key === startArea)) selectArea(startArea);
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
   // Open a specific tab when arriving via gallery.html?filter=interior
  const startFilter = new URLSearchParams(window.location.search).get('filter');
  const startTab = tabs.find(t => t.dataset.filter === startFilter);
  if (startTab) activateTab(startTab);

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