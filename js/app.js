/**
 * Khmer Kitchen Bangalore - Controller
 * Luxury Minimalist & Spacious Experience with Alternating Color Combinations:
 * - Pair 1: Background #ffe8b8, Combination Accent #085053 (Dark Cyan)
 * - Pair 2: Background #b6e5e8, Combination Accent #c45620 (Terracotta Orange)
 */

const state = {
  view: 'home', // 'home', 'category', 'order-success'
  currentCategory: 'soups',
  vegFilter: false,
  nonVegFilter: false,
  searchQuery: '',
  cart: [],
  tableNumber: '12',
  tableSection: 'Courtyard Garden',
  lastScrollTop: 0
};

let somnangGuide = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AI Guide
  if (typeof SomnangAIGuide !== 'undefined' && typeof MENU_ITEMS !== 'undefined') {
    somnangGuide = new SomnangAIGuide(MENU_ITEMS, MENU_CATEGORIES, KHMER_GLOSSARY);
  }

  // Render 10 Category Square Boxes on Home Page (2 cols x 5 rows)
  renderHomeCategoryGrid();

  // Render Signature Dishes Row on Home Page (#b6e5e8 section)
  renderHomeSignatureRow();

  // Setup Event Listeners
  setupEventListeners();

  // Initialize AI Welcome
  initSomnangWelcome();
});

// 1. Render 10 Square Boxes on Home Overview Page
function renderHomeCategoryGrid() {
  const container = document.getElementById('home-category-grid');
  if (!container) return;

  container.innerHTML = MENU_CATEGORIES.map(cat => `
    <div 
      class="category-square-card group" 
      onclick="openCategoryPage('${cat.id}')"
    >
      <img 
        src="${cat.image}" 
        alt="${cat.name}" 
        loading="lazy"
        onerror="this.src='images/ambience1.jpg'"
      />
      <div class="category-card-overlay">
        <span class="category-card-title">${cat.name}</span>
      </div>
    </div>
  `).join('');
}

// 2. Render KHMER Signature Dishes in the #b6e5e8 section of the Home Page
function renderHomeSignatureRow() {
  const container = document.getElementById('home-signatures-row');
  if (!container) return;

  const signatureItems = MENU_ITEMS.filter(item => item.isKhmerSignature);

  container.innerHTML = signatureItems.map(item => `
    <div class="min-w-[240px] max-w-[260px] flex-shrink-0 white-dish-card flex flex-col justify-between cursor-pointer" onclick="openDishModal('${item.id}')">
      <div>
        <div class="w-full h-32 rounded-xl overflow-hidden bg-gray-100 mb-3">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover"
            onerror="this.src='images/ambience1.jpg'"
          />
        </div>
        <div class="flex items-center space-x-1.5 mb-1 text-[11px] font-semibold">
          <span>${item.dietary === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
          ${item.isGlutenFree ? '<span class="text-gray-500">• 🌾 GF</span>' : ''}
        </div>
        <h4 class="font-bold text-sm text-black line-clamp-1">${item.name}</h4>
        ${item.khmerName ? `<p class="text-[10px] text-gray-500 font-serif mt-0.5">${item.khmerName}</p>` : ''}
        <p class="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">${item.shortDesc}</p>
      </div>

      <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
        <span class="font-mono text-sm font-bold text-black">₹${item.price}</span>
        <button 
          onclick="event.stopPropagation(); addToCart('${item.id}', 1)"
          class="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition active:scale-95"
          style="background-color: var(--pair2-combo);"
        >
          + ADD
        </button>
      </div>
    </div>
  `).join('');
}

// 3. Open Category Page (with 2 Alternating Color Combinations)
function openCategoryPage(categoryId) {
  state.view = 'category';
  state.currentCategory = categoryId;

  const homeView = document.getElementById('home-scroll-view');
  const catView = document.getElementById('category-page-view');

  if (homeView && catView) {
    homeView.classList.add('hidden');
    catView.classList.remove('hidden');
    catView.scrollTop = 0;
  }

  // Determine Color Pair for this category:
  // Pair 1: Soups, Dim Sum, Appetizers, Asian Bowls, Rice & Noodles (#ffe8b8, Dark Cyan #085053)
  // Pair 2: Baos, Sushi, Skewers & Satays, Mains, Desserts (#b6e5e8, Terracotta #c45620)
  const catObj = MENU_CATEGORIES.find(c => c.id === categoryId) || MENU_CATEGORIES[0];
  const isPair1 = categoryId === 'all' || catObj.pair === 1;
  const currentBg = isPair1 ? '#ffe8b8' : '#b6e5e8';
  const currentCombo = isPair1 ? '#085053' : '#c45620';

  // Apply Background to Category Page Container
  catView.style.backgroundColor = currentBg;

  // Update AI Chat Circle Accent Color
  const aiCircle = document.getElementById('floating-ai-circle');
  if (aiCircle) {
    aiCircle.style.backgroundColor = currentCombo;
  }

  // Render Horizontal Category Switcher Bar (Names only + 'All')
  renderCategoryHorizontalSwitcher(categoryId, currentCombo);

  // Render Items for this category
  renderCategoryItems(categoryId, currentCombo);

  // Update End-of-Page Cambodian Food Script matching the pair combination color
  const scriptEl = document.getElementById('category-page-cambodian-script');
  if (scriptEl) {
    scriptEl.style.color = currentCombo;
  }
}

// 4. Return Back to Home Overview Page
function goBackToHome() {
  state.view = 'home';
  const homeView = document.getElementById('home-scroll-view');
  const catView = document.getElementById('category-page-view');

  if (homeView && catView) {
    catView.classList.add('hidden');
    homeView.classList.remove('hidden');
  }

  // Reset AI Circle to Pair 1 Accent
  const aiCircle = document.getElementById('floating-ai-circle');
  if (aiCircle) {
    aiCircle.style.backgroundColor = 'var(--pair1-combo)';
  }
}

// 5. Render Horizontal Category Switcher (Names only + 'All')
function renderCategoryHorizontalSwitcher(selectedCatId, comboColor) {
  const container = document.getElementById('category-horizontal-pills');
  if (!container) return;

  const categoriesWithAll = [
    { id: 'all', name: 'All' },
    ...MENU_CATEGORIES
  ];

  container.innerHTML = categoriesWithAll.map(cat => {
    const isSelected = cat.id === selectedCatId;
    return `
      <button 
        class="category-pill-item whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border"
        data-cat-id="${cat.id}"
        onclick="openCategoryPage('${cat.id}')"
        style="${isSelected 
          ? `background-color: ${comboColor}; color: #ffffff; border-color: ${comboColor};` 
          : 'background-color: #ffffff; color: #1a1a1a; border-color: rgba(0,0,0,0.08);'}"
      >
        ${cat.name}
      </button>
    `;
  }).join('');

  // Auto-scroll selected pill into view
  const activePill = container.querySelector(`[data-cat-id="${selectedCatId}"]`);
  if (activePill) {
    activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

// 6. Render Items in the Category Page
function renderCategoryItems(categoryId, comboColor) {
  const titleEl = document.getElementById('category-page-title');
  const subtitleEl = document.getElementById('category-page-subtitle');
  const listContainer = document.getElementById('category-dishes-list');
  if (!listContainer) return;

  let catName = 'All Dishes';
  let catSub = 'Explore our full menu';

  if (categoryId !== 'all') {
    const cat = MENU_CATEGORIES.find(c => c.id === categoryId);
    if (cat) {
      catName = cat.name;
      catSub = cat.subtitle;
    }
  }

  if (titleEl) {
    titleEl.textContent = catName;
    titleEl.style.color = comboColor; // Heading takes combination color!
  }
  if (subtitleEl) {
    subtitleEl.textContent = catSub;
  }

  // Filter items by category, veg/non-veg toggles, and search query
  let items = MENU_ITEMS.filter(item => {
    // Category match
    if (categoryId !== 'all' && item.categoryId !== categoryId) return false;

    // Toggle switch filters
    if (state.vegFilter && !state.nonVegFilter) {
      if (item.dietary !== 'veg' && item.dietary !== 'vegan') return false;
    } else if (state.nonVegFilter && !state.vegFilter) {
      if (item.dietary !== 'non-veg') return false;
    }

    // Search query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.shortDesc.toLowerCase().includes(q);
      const matchIng = item.ingredients.some(ing => ing.toLowerCase().includes(q));
      return matchName || matchDesc || matchIng;
    }

    return true;
  });

  if (items.length === 0) {
    listContainer.innerHTML = `
      <div class="py-16 text-center">
        <div class="text-3xl mb-2">🍽️</div>
        <h4 class="font-bold text-sm text-black">No dishes found</h4>
        <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Try switching the Veg / Non-Veg toggles or clear your search.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = items.map(item => {
    const cartEntry = state.cart.find(c => c.item.id === item.id);
    const cartQty = cartEntry ? cartEntry.quantity : 0;

    return `
      <div class="white-dish-card flex gap-3.5 cursor-pointer" onclick="openDishModal('${item.id}')">
        <!-- Thumbnail -->
        <div class="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover"
            onerror="this.src='images/ambience1.jpg'"
          />
          ${item.isKhmerSignature ? `
            <div class="absolute top-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              🇰🇭 KHMER
            </div>
          ` : ''}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-1.5 text-[11px] font-medium mb-1">
              <span>${item.dietary === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
              ${item.isGlutenFree ? '<span class="text-gray-400">• GF</span>' : ''}
              ${item.spiceLevel > 1 ? '<span class="text-gray-400">• 🌶️ Spicy</span>' : ''}
            </div>

            <h4 class="font-bold text-sm text-black line-clamp-1 leading-snug">${item.name}</h4>
            ${item.khmerName ? `<p class="text-[10px] text-gray-500 font-serif mt-0.5">${item.khmerName}</p>` : ''}
            <p class="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">${item.shortDesc}</p>
          </div>

          <!-- Bottom Price & Order -->
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span class="font-mono text-sm font-bold text-black">₹${item.price}</span>

            <div class="flex items-center space-x-1.5" onclick="event.stopPropagation()">
              ${cartQty === 0 ? `
                <button 
                  onclick="addToCart('${item.id}', 1)"
                  class="px-3.5 py-1 rounded-xl text-xs font-bold text-white transition active:scale-95 shadow-sm"
                  style="background-color: ${comboColor};"
                >
                  + ADD
                </button>
              ` : `
                <div class="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                  <button 
                    onclick="updateCartQuantity('${item.id}', -1)"
                    class="px-2 py-0.5 text-black font-bold text-xs hover:bg-gray-200"
                  >
                    −
                  </button>
                  <span class="px-2 text-xs font-bold font-mono text-black">${cartQty}</span>
                  <button 
                    onclick="updateCartQuantity('${item.id}', 1)"
                    class="px-2 py-0.5 text-black font-bold text-xs hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 7. Scroll Behavior: Hide top bar on scroll down, show on scroll up
function handleCategoryPageScroll(e) {
  const header = document.getElementById('category-collapsible-header');
  if (!header) return;

  const currentScroll = e.target.scrollTop;

  if (currentScroll > state.lastScrollTop && currentScroll > 60) {
    // Scrolling down -> hide header
    header.classList.add('header-hidden');
    header.classList.remove('header-visible');
  } else {
    // Scrolling up -> show header
    header.classList.remove('header-hidden');
    header.classList.add('header-visible');
  }

  state.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

// 8. Dish Modal Detail
function openDishModal(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('dish-detail-modal');
  const content = document.getElementById('dish-detail-content');
  if (!modal || !content) return;

  const cartEntry = state.cart.find(c => c.item.id === item.id);
  const qty = cartEntry ? cartEntry.quantity : 1;

  content.innerHTML = `
    <!-- Image -->
    <div class="relative w-full h-56 bg-black">
      <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.src='images/ambience1.jpg'" />
      <button 
        onclick="closeDishModal()"
        class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
      >
        ✕
      </button>
    </div>

    <!-- Body -->
    <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scroll bg-white text-black">
      <div>
        <div class="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-1">
          <span>${item.dietary === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}</span>
          ${item.isGlutenFree ? '<span>• 🌾 Gluten-Free</span>' : ''}
        </div>
        <h3 class="font-bold text-lg text-black">${item.name}</h3>
        ${item.khmerName ? `<p class="text-xs text-gray-500 font-serif">${item.khmerName}</p>` : ''}
        <p class="text-xs text-gray-700 mt-2 leading-relaxed">${item.fullDesc}</p>
      </div>

      <!-- Quick Specs -->
      <div class="grid grid-cols-3 gap-2 py-2.5 border-y border-gray-100 text-center text-xs">
        <div>
          <span class="text-gray-400 block text-[10px]">Portion</span>
          <span class="font-semibold text-gray-800">${item.portion || 'Shareable'}</span>
        </div>
        <div>
          <span class="text-gray-400 block text-[10px]">Prep Time</span>
          <span class="font-semibold text-gray-800">${item.prepTime || '12 mins'}</span>
        </div>
        <div>
          <span class="text-gray-400 block text-[10px]">Energy</span>
          <span class="font-semibold text-gray-800">${item.calories || '~300 kcal'}</span>
        </div>
      </div>

      <!-- Ingredients -->
      <div>
        <h5 class="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">Ingredients</h5>
        <div class="flex flex-wrap gap-1.5">
          ${item.ingredients.map(ing => `
            <span class="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
              ${ing}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Chef Note -->
      <div>
        <label class="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
          Special Kitchen Request
        </label>
        <input 
          type="text" 
          id="modal-item-note"
          placeholder="e.g. Less spicy, lime on side..."
          class="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black"
          value="${cartEntry && cartEntry.notes ? cartEntry.notes : ''}"
        />
      </div>
    </div>

    <!-- Bottom Add -->
    <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
      <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button onclick="adjustModalQty(-1)" class="w-8 h-9 text-black font-bold text-sm hover:bg-gray-100">−</button>
        <span id="modal-qty-display" class="w-8 text-center text-sm font-bold font-mono text-black">${qty}</span>
        <button onclick="adjustModalQty(1)" class="w-8 h-9 text-black font-bold text-sm hover:bg-gray-100">+</button>
      </div>

      <button 
        onclick="confirmModalAddToCart('${item.id}')"
        class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 transition flex items-center justify-center space-x-2"
      >
        <span>Add to Table Order</span>
        <span class="font-mono">(₹<span id="modal-total-price">${item.price * qty}</span>)</span>
      </button>
    </div>
  `;

  modal.classList.remove('sheet-closed');
  modal.classList.add('sheet-open');
  document.getElementById('modal-backdrop').classList.remove('hidden-backdrop');
}

function closeDishModal() {
  const modal = document.getElementById('dish-detail-modal');
  if (modal) {
    modal.classList.remove('sheet-open');
    modal.classList.add('sheet-closed');
  }
  document.getElementById('modal-backdrop').classList.add('hidden-backdrop');
}

function adjustModalQty(delta) {
  const qtyEl = document.getElementById('modal-qty-display');
  const priceEl = document.getElementById('modal-total-price');
  if (!qtyEl) return;

  let current = parseInt(qtyEl.textContent) || 1;
  current = Math.max(1, current + delta);
  qtyEl.textContent = current;

  // calculate price
  const activeDish = MENU_ITEMS.find(i => i.id === document.querySelector('#modal-item-note').getAttribute('data-dish-id'));
  if (priceEl && activeDish) {
    priceEl.textContent = activeDish.price * current;
  }
}

function confirmModalAddToCart(itemId) {
  const noteInput = document.getElementById('modal-item-note');
  const notes = noteInput ? noteInput.value.trim() : '';
  const qtyEl = document.getElementById('modal-qty-display');
  const qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;

  addToCart(itemId, qty, notes, true);
  closeDishModal();
}

// 9. Cart Management & Floating Indicator
function addToCart(itemId, quantity = 1, notes = '', isReplacement = false) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const existingIndex = state.cart.findIndex(c => c.item.id === itemId);
  if (existingIndex >= 0) {
    if (isReplacement) {
      state.cart[existingIndex].quantity = quantity;
    } else {
      state.cart[existingIndex].quantity += quantity;
    }
    if (notes) state.cart[existingIndex].notes = notes;
  } else {
    state.cart.push({ item, quantity, notes });
  }

  updateCartUI();
  if (state.view === 'category') {
    const cat = MENU_CATEGORIES.find(c => c.id === state.currentCategory) || MENU_CATEGORIES[0];
    const comboColor = cat.pair === 1 ? '#085053' : '#c45620';
    renderCategoryItems(state.currentCategory, comboColor);
  }
}

function updateCartQuantity(itemId, delta) {
  const existingIndex = state.cart.findIndex(c => c.item.id === itemId);
  if (existingIndex >= 0) {
    state.cart[existingIndex].quantity += delta;
    if (state.cart[existingIndex].quantity <= 0) {
      state.cart.splice(existingIndex, 1);
    }
  }

  updateCartUI();
  if (state.view === 'category') {
    const cat = MENU_CATEGORIES.find(c => c.id === state.currentCategory) || MENU_CATEGORIES[0];
    const comboColor = cat.pair === 1 ? '#085053' : '#c45620';
    renderCategoryItems(state.currentCategory, comboColor);
  }
}

function updateCartUI() {
  const cartBar = document.getElementById('floating-cart-bar');
  const countBadge = document.getElementById('floating-cart-count');
  const totalVal = document.getElementById('floating-cart-total');

  const count = state.cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  if (countBadge) countBadge.textContent = count;
  if (totalVal) totalVal.textContent = `₹${subtotal}`;

  if (cartBar) {
    if (count > 0) {
      cartBar.classList.remove('translate-y-24', 'opacity-0');
      cartBar.classList.add('translate-y-0', 'opacity-100');
    } else {
      cartBar.classList.remove('translate-y-0', 'opacity-100');
      cartBar.classList.add('translate-y-24', 'opacity-0');
    }
  }
}

// 10. Order Cart Sheet Drawer
function openCartSheet() {
  const sheet = document.getElementById('order-cart-sheet');
  const content = document.getElementById('cart-sheet-content');
  if (!sheet || !content) return;

  const totalCount = state.cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  if (state.cart.length === 0) {
    content.innerHTML = `
      <div class="py-12 text-center text-black">
        <div class="text-3xl mb-2">🍽️</div>
        <h4 class="font-bold text-sm">Your table order is empty</h4>
        <p class="text-xs text-gray-500 mt-1">Tap + on any dish to add to Table ${state.tableNumber}.</p>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Dine-In Table</span>
          <span class="text-xs font-bold text-black">Table ${state.tableNumber} • ${state.tableSection}</span>
        </div>
        <button onclick="promptEditTable()" class="text-xs font-semibold text-gray-600 underline">Edit</button>
      </div>

      <div class="space-y-2 mb-4 max-h-52 overflow-y-auto custom-scroll">
        ${state.cart.map(c => `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100">
            <div>
              <h5 class="text-xs font-bold text-black">${c.item.name}</h5>
              <span class="text-[10px] font-mono text-gray-500">₹${c.item.price} each</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex items-center bg-gray-100 border border-gray-200 rounded-lg">
                <button onclick="updateCartQuantity('${c.item.id}', -1); openCartSheet();" class="px-2 py-0.5 text-black text-xs font-bold">−</button>
                <span class="px-2 text-xs font-bold font-mono text-black">${c.quantity}</span>
                <button onclick="updateCartQuantity('${c.item.id}', 1); openCartSheet();" class="px-2 py-0.5 text-black text-xs font-bold">+</button>
              </div>
              <span class="font-mono text-xs font-bold text-black w-12 text-right">₹${c.item.price * c.quantity}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
        <div class="flex justify-between text-gray-600">
          <span>Subtotal (${totalCount} item${totalCount > 1 ? 's' : ''})</span>
          <span class="font-mono text-black">₹${subtotal}</span>
        </div>
        <div class="flex justify-between text-gray-500 text-[11px]">
          <span>GST (5%)</span>
          <span class="font-mono text-black">₹${gst}</span>
        </div>
        <div class="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-black">
          <span>Total Bill</span>
          <span class="font-mono">₹${grandTotal}</span>
        </div>
      </div>

      <button 
        onclick="placeOrder()"
        class="w-full mt-4 py-3 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 transition"
      >
        Send Order to Kitchen (₹${grandTotal})
      </button>
    `;
  }

  sheet.classList.remove('sheet-closed');
  sheet.classList.add('sheet-open');
  document.getElementById('modal-backdrop').classList.remove('hidden-backdrop');
}

function closeCartSheet() {
  const sheet = document.getElementById('order-cart-sheet');
  if (sheet) {
    sheet.classList.remove('sheet-open');
    sheet.classList.add('sheet-closed');
  }
  document.getElementById('modal-backdrop').classList.add('hidden-backdrop');
}

function promptEditTable() {
  const num = prompt('Enter your Dine-In Table Number (1-35):', state.tableNumber);
  if (num && num.trim()) {
    state.tableNumber = num.trim();
    openCartSheet();
  }
}

// 11. Place Order & Success Screen
function placeOrder() {
  if (state.cart.length === 0) return;
  const orderId = 'KK-' + Math.floor(1000 + Math.random() * 9000);

  const idEl = document.getElementById('success-order-id');
  const tableEl = document.getElementById('success-table-text');
  const totalEl = document.getElementById('success-total-val');
  const itemsEl = document.getElementById('success-order-items');

  if (idEl) idEl.textContent = orderId;
  if (tableEl) tableEl.textContent = `Table ${state.tableNumber} • ${state.tableSection}`;

  const subtotal = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
  const gst = Math.round(subtotal * 0.05);
  if (totalEl) totalEl.textContent = `₹${subtotal + gst}`;

  if (itemsEl) {
    itemsEl.innerHTML = state.cart.map(c => `
      <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-none">
        <span class="text-gray-800">${c.quantity}x ${c.item.name}</span>
        <span class="font-mono font-semibold text-black">₹${c.item.price * c.quantity}</span>
      </div>
    `).join('');
  }

  state.cart = [];
  updateCartUI();
  closeCartSheet();

  // Hide other views and show success view
  document.getElementById('home-scroll-view').classList.add('hidden');
  document.getElementById('category-page-view').classList.add('hidden');
  document.getElementById('order-success-view').classList.remove('hidden');
}

function dismissSuccessScreen() {
  document.getElementById('order-success-view').classList.add('hidden');
  document.getElementById('home-scroll-view').classList.remove('hidden');
}

// 12. Somnang AI Concierge Drawer
function initSomnangWelcome() {
  if (!somnangGuide) return;
  const welcome = somnangGuide.getWelcomeMessage();
  appendAIMessage(welcome);
}

function openAIChat() {
  const drawer = document.getElementById('ai-chat-drawer');
  if (!drawer) return;
  drawer.classList.remove('sheet-closed');
  drawer.classList.add('sheet-open');
  document.getElementById('modal-backdrop').classList.remove('hidden-backdrop');
}

function closeAIChat() {
  const drawer = document.getElementById('ai-chat-drawer');
  if (drawer) {
    drawer.classList.remove('sheet-open');
    drawer.classList.add('sheet-closed');
  }
  document.getElementById('modal-backdrop').classList.add('hidden-backdrop');
}

function sendAIMessage(presetText) {
  const input = document.getElementById('ai-user-input');
  const text = presetText || (input ? input.value.trim() : '');
  if (!text || !somnangGuide) return;

  if (input) input.value = '';

  appendUserMessage(text);
  setTimeout(() => {
    const reply = somnangGuide.processMessage(text);
    appendAIMessage(reply);
  }, 350);
}

function appendUserMessage(text) {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'flex justify-end mb-2.5';
  div.innerHTML = `
    <div class="max-w-[80%] bg-black text-white text-xs px-3.5 py-2 rounded-2xl rounded-tr-none">
      ${text}
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendAIMessage(reply) {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;

  let formatted = reply.text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  let dishesHtml = '';
  if (reply.dishes && reply.dishes.length > 0) {
    dishesHtml = `
      <div class="mt-2.5 space-y-1.5">
        ${reply.dishes.map(d => `
          <div class="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
            <div class="min-w-0">
              <span class="text-[11px] font-bold text-black block truncate">${d.name}</span>
              <span class="text-[10px] font-mono text-gray-500">₹${d.price}</span>
            </div>
            <button 
              onclick="addToCart('${d.id}', 1)"
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-black hover:bg-gray-800"
            >
              + Add
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  let suggestionsHtml = '';
  if (reply.suggestions && reply.suggestions.length > 0) {
    suggestionsHtml = `
      <div class="mt-2.5 flex flex-wrap gap-1">
        ${reply.suggestions.map(s => `
          <button 
            onclick="sendAIMessage('${s.replace(/'/g, "\\'")}')"
            class="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-left"
          >
            ${s}
          </button>
        `).join('')}
      </div>
    `;
  }

  const div = document.createElement('div');
  div.className = 'flex justify-start mb-2.5';
  div.innerHTML = `
    <div class="max-w-[88%] bg-white text-black text-xs p-3.5 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
      <div class="text-[11px] font-bold text-gray-500 mb-1">✨ Somnang (AI Food Guide)</div>
      <div class="leading-relaxed text-gray-800">${formatted}</div>
      ${dishesHtml}
      ${suggestionsHtml}
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// 13. Event Listeners Setup
function setupEventListeners() {
  // Category Page Scroll Listener (for hide/show header)
  const catView = document.getElementById('category-page-view');
  if (catView) {
    catView.addEventListener('scroll', handleCategoryPageScroll);
  }

  // Search Input on Category Page
  const searchInput = document.getElementById('category-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      const cat = MENU_CATEGORIES.find(c => c.id === state.currentCategory) || MENU_CATEGORIES[0];
      const comboColor = cat.pair === 1 ? '#085053' : '#c45620';
      renderCategoryItems(state.currentCategory, comboColor);
    });
  }

  // Veg / Non-Veg Toggle Inputs
  const vegToggle = document.getElementById('toggle-veg-input');
  if (vegToggle) {
    vegToggle.addEventListener('change', (e) => {
      state.vegFilter = e.target.checked;
      const cat = MENU_CATEGORIES.find(c => c.id === state.currentCategory) || MENU_CATEGORIES[0];
      const comboColor = cat.pair === 1 ? '#085053' : '#c45620';
      renderCategoryItems(state.currentCategory, comboColor);
    });
  }

  const nonVegToggle = document.getElementById('toggle-nonveg-input');
  if (nonVegToggle) {
    nonVegToggle.addEventListener('change', (e) => {
      state.nonVegFilter = e.target.checked;
      const cat = MENU_CATEGORIES.find(c => c.id === state.currentCategory) || MENU_CATEGORIES[0];
      const comboColor = cat.pair === 1 ? '#085053' : '#c45620';
      renderCategoryItems(state.currentCategory, comboColor);
    });
  }

  // Modal Backdrop Click
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeDishModal();
      closeCartSheet();
      closeAIChat();
    });
  }
}
