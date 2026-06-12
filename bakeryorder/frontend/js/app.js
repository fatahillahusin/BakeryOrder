// ============================================
// BakeryOrder - Main JavaScript
// ============================================

const API_BASE = '/api';

// ============ STATE ============
let state = {
  cart: [],
  menuItems: [],
  categories: [],
  currentCategory: 'all',
  user: null,
  token: null,
  orders: [],
};

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderNav();
  updateCartBadge();

  const path = window.location.hash || '#menu';
  navigateTo(path.replace('#', ''));
});

// ============ STORAGE ============
function loadFromStorage() {
  const token = localStorage.getItem('bakery_token');
  const user = localStorage.getItem('bakery_user');
  const cart = localStorage.getItem('bakery_cart');
  if (token) state.token = token;
  if (user) state.user = JSON.parse(user);
  if (cart) state.cart = JSON.parse(cart);
}

function saveCart() {
  localStorage.setItem('bakery_cart', JSON.stringify(state.cart));
}

function saveAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('bakery_token', token);
  localStorage.setItem('bakery_user', JSON.stringify(user));
}

function clearAuth() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('bakery_token');
  localStorage.removeItem('bakery_user');
}

// ============ NAVIGATION ============
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    window.location.hash = page;
  }

  // Load data per page
  if (page === 'menu') loadMenu();
  if (page === 'dashboard') {
    if (!state.token) { showLoginRequired(); return; }
    loadDashboard();
  }
  if (page === 'admin') {
    if (!state.token || state.user?.role !== 'admin') { showToast('Akses admin diperlukan', 'error'); return; }
    loadAdminMenu();
  }
}

function renderNav() {
  const navRight = document.getElementById('nav-right');
  if (!navRight) return;

  if (state.user) {
    navRight.innerHTML = `
      <span style="color: var(--cream); font-size: 0.85rem; opacity: 0.8;">
        👤 ${state.user.full_name} <span style="color: var(--gold-light);">(${state.user.role})</span>
      </span>
      ${state.user.role === 'admin' ? `<button class="nav-btn" onclick="navigateTo('admin')">⚙️ Admin</button>` : ''}
      <button class="nav-btn" onclick="navigateTo('dashboard')">📋 Pesanan</button>
      <button class="nav-btn" onclick="logout()">Keluar</button>
    `;
  } else {
    navRight.innerHTML = `
      <button class="nav-btn" onclick="navigateTo('menu')">🍞 Menu</button>
      <button class="nav-btn primary" onclick="navigateTo('login')">🔐 Staff Login</button>
    `;
  }
}

// ============ MENU PAGE ============
async function loadMenu() {
  const grid = document.getElementById('menu-grid');
  const catContainer = document.getElementById('category-tabs');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const [menuRes, catRes] = await Promise.all([
      fetch(`${API_BASE}/menu?available=true`),
      fetch(`${API_BASE}/menu/categories`)
    ]);
    const menuData = await menuRes.json();
    const catData = await catRes.json();

    state.menuItems = menuData.data || [];
    state.categories = catData.data || [];

    renderCategoryTabs();
    renderMenuGrid(state.menuItems);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <div style="text-align:center; padding: 60px; color: var(--text-light); grid-column: 1/-1;">
        <div style="font-size: 3rem; margin-bottom: 12px;">📡</div>
        <p>Gagal memuat menu. Pastikan server berjalan.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 12px;" onclick="loadMenu()">Coba Lagi</button>
      </div>
    `;
  }
}

function renderCategoryTabs() {
  const container = document.getElementById('category-tabs');
  if (!container) return;

  const all = `<button class="cat-tab ${state.currentCategory === 'all' ? 'active' : ''}" onclick="filterCategory('all')">🍽️ Semua</button>`;
  const cats = state.categories.map(c =>
    `<button class="cat-tab ${state.currentCategory == c.id ? 'active' : ''}" onclick="filterCategory(${c.id})">${categoryIcon(c.name)} ${c.name}</button>`
  ).join('');
  container.innerHTML = all + cats;
}

function categoryIcon(name) {
  if (name.includes('Roti')) return '🍞';
  if (name.includes('Kue')) return '🎂';
  if (name.includes('Minum')) return '☕';
  return '🍽️';
}

function filterCategory(catId) {
  state.currentCategory = catId;
  renderCategoryTabs();
  const filtered = catId === 'all'
    ? state.menuItems
    : state.menuItems.filter(m => m.category_id == catId);
  renderMenuGrid(filtered);
}

function renderMenuGrid(items) {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="text-align:center; padding: 60px; color: var(--text-light); grid-column: 1/-1;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
        <p>Tidak ada menu yang tersedia</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="menu-card fade-in">
      <div class="menu-card-img-wrap">
        <img class="menu-card-img" src="${item.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}" 
             alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x200?text=Bakery'">
        <span class="menu-card-badge">${item.category_name}</span>
        ${!item.is_available ? '<div class="unavailable-overlay">❌ Tidak Tersedia</div>' : ''}
      </div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.description || 'Produk bakeri pilihan'}</div>
        <div class="menu-card-footer">
          <div class="menu-price">${formatRupiah(item.price)}</div>
          <button class="add-to-cart-btn" onclick="addToCart(${item.id})" ${!item.is_available ? 'disabled' : ''}>
            + Pesan
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ============ CART ============
function addToCart(menuItemId) {
  const item = state.menuItems.find(m => m.id == menuItemId);
  if (!item) return;

  const existing = state.cart.find(c => c.menu_item_id == menuItemId);
  if (existing) {
    existing.quantity++;
  } else {
    state.cart.push({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`✅ ${item.name} ditambahkan ke keranjang`, 'success');
}

function updateCartBadge() {
  const total = state.cart.reduce((s, c) => s + c.quantity, 0);
  document.querySelectorAll('.cart-badge, .cart-fab-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function openCart() {
  renderCartModal();
  document.getElementById('cart-modal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function renderCartModal() {
  const body = document.getElementById('cart-modal-body');
  if (!body) return;

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Keranjang belanja Anda masih kosong.</p>
        <p style="margin-top:6px; font-size: 0.82rem;">Pilih menu yang ingin dipesan!</p>
      </div>
    `;
    return;
  }

  const subtotal = state.cart.reduce((s, c) => s + (c.price * c.quantity), 0);

  body.innerHTML = `
    <div id="cart-items">
      ${state.cart.map((item, idx) => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image_url || ''}" alt="${item.name}" 
               onerror="this.src='https://via.placeholder.com/56x56?text=🍞'">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatRupiah(item.price)} / item</div>
          </div>
          <div class="cart-qty-control">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
            <button class="qty-btn remove" onclick="removeFromCart(${idx})" title="Hapus">🗑</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="cart-total-row">
      <span class="cart-total-label">Total Pesanan</span>
      <span class="cart-total-amount">${formatRupiah(subtotal)}</span>
    </div>
    <div style="margin-top: 16px;">
      <button class="btn btn-primary btn-full btn-lg" onclick="openCheckout()">
        🧾 Lanjut ke Pemesanan
      </button>
      <button class="btn btn-outline btn-full btn-sm" style="margin-top: 10px;" onclick="clearCart()">
        🗑️ Kosongkan Keranjang
      </button>
    </div>
  `;
}

function changeQty(idx, delta) {
  state.cart[idx].quantity += delta;
  if (state.cart[idx].quantity <= 0) state.cart.splice(idx, 1);
  saveCart();
  updateCartBadge();
  renderCartModal();
}

function removeFromCart(idx) {
  state.cart.splice(idx, 1);
  saveCart();
  updateCartBadge();
  renderCartModal();
}

function clearCart() {
  if (!confirm('Hapus semua item di keranjang?')) return;
  state.cart = [];
  saveCart();
  updateCartBadge();
  renderCartModal();
}

// ============ CHECKOUT ============
function openCheckout() {
  if (state.cart.length === 0) { showToast('Keranjang kosong!', 'error'); return; }
  closeModal('cart-modal');
  renderCheckoutModal();
  document.getElementById('checkout-modal').classList.add('open');
}

function renderCheckoutModal() {
  const body = document.getElementById('checkout-modal-body');
  if (!body) return;

  const subtotal = state.cart.reduce((s, c) => s + (c.price * c.quantity), 0);

  body.innerHTML = `
    <div style="background: var(--cream-mid); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 20px;">
      <div style="font-weight: 600; color: var(--brown-dark); margin-bottom: 8px;">Ringkasan Pesanan:</div>
      ${state.cart.map(item => `
        <div class="order-detail-item">
          <span>${item.name} x${item.quantity}</span>
          <span>${formatRupiah(item.price * item.quantity)}</span>
        </div>
      `).join('')}
      <div style="display:flex; justify-content:space-between; margin-top: 10px; font-weight: 700; color: var(--brown-dark);">
        <span>TOTAL</span>
        <span>${formatRupiah(subtotal)}</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Nama Pelanggan *</label>
      <input type="text" class="form-control" id="input-customer-name" placeholder="Masukkan nama Anda">
    </div>
    <div class="form-group">
      <label class="form-label">Nomor Meja</label>
      <input type="text" class="form-control" id="input-table-number" placeholder="Contoh: 5 (kosongkan jika takeaway)">
    </div>
    <div class="form-group">
      <label class="form-label">Metode Pembayaran</label>
      <select class="form-control" id="input-payment-method">
        <option value="cash">💵 Cash</option>
        <option value="transfer">🏦 Transfer Bank</option>
        <option value="qris">📱 QRIS</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Catatan (opsional)</label>
      <textarea class="form-control" id="input-notes" rows="2" placeholder="Contoh: tidak pakai gula, extra keju..."></textarea>
    </div>
    <button class="btn btn-primary btn-full btn-lg" onclick="submitOrder()" id="submit-order-btn">
      🛒 Kirim Pesanan
    </button>
  `;
}

async function submitOrder() {
  const customerName = document.getElementById('input-customer-name')?.value?.trim();
  const tableNumber = document.getElementById('input-table-number')?.value?.trim();
  const paymentMethod = document.getElementById('input-payment-method')?.value;
  const notes = document.getElementById('input-notes')?.value?.trim();

  if (!customerName) { showToast('Nama pelanggan wajib diisi', 'error'); return; }

  const btn = document.getElementById('submit-order-btn');
  btn.textContent = '⏳ Memproses...';
  btn.disabled = true;

  const payload = {
    customer_name: customerName,
    table_number: tableNumber || null,
    payment_method: paymentMethod,
     notes: notes || null,
    items: state.cart.map(c => ({ menu_item_id: c.menu_item_id, quantity: c.quantity }))
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      const body = document.getElementById('checkout-modal-body');
      body.innerHTML = `
        <div class="order-success fade-in">
          <div class="success-icon">🎉</div>
          <div class="success-title">Pesanan Berhasil Dikirim!</div>
          <p style="color: var(--text-light); font-size: 0.9rem;">Nomor pesanan Anda:</p>
          <div class="success-order-num">${data.data.order_number}</div>
          <p style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 20px;">
            Total: <strong>${formatRupiah(data.data.total_amount)}</strong><br>
            Silahkan tunjukkan nomor ini ke kasir untuk pembayaran.
          </p>
          <button class="btn btn-primary btn-full" onclick="closeModal('checkout-modal')">
            ✅ Selesai
          </button>
        </div>
      `;
      state.cart = [];
      saveCart();
      updateCartBadge();
    } else {
      showToast(data.message || 'Gagal membuat pesanan', 'error');
      btn.textContent = '🛒 Kirim Pesanan';
      btn.disabled = false;
    }
  } catch (err) {
    showToast('Koneksi gagal. Coba lagi.', 'error');
    btn.textContent = '🛒 Kirim Pesanan';
    btn.disabled = false;
  }
}

// ============ LOGIN ============
async function doLogin() {
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const btn = document.getElementById('login-btn');

  if (!username || !password) { showToast('Username dan password wajib diisi', 'error'); return; }

  btn.textContent = '⏳ Masuk...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      saveAuth(data.data.token, data.data.user);
      showToast(`Selamat datang, ${data.data.user.full_name}! 🎉`, 'success');
      renderNav();
      navigateTo('dashboard');
    } else {
      showToast(data.message || 'Login gagal', 'error');
      btn.textContent = '🔐 Masuk';
      btn.disabled = false;
    }
  } catch (err) {
    showToast('Koneksi ke server gagal', 'error');
    btn.textContent = '🔐 Masuk';
    btn.disabled = false;
  }
}

function logout() {
  clearAuth();
  renderNav();
  navigateTo('menu');
  showToast('Berhasil keluar', 'info');
}

function showLoginRequired() {
  navigateTo('login');
  showToast('Silahkan login terlebih dahulu', 'info');
}

// ============ DASHBOARD (KASIR) ============
async function loadDashboard() {
  await Promise.all([loadStats(), loadOrders()]);
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/orders/stats/today`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) {
      const s = data.data;
      document.getElementById('stat-orders').textContent = s.total_orders || 0;
      document.getElementById('stat-pending').textContent = s.pending || 0;
      document.getElementById('stat-done').textContent = s.completed || 0;
      document.getElementById('stat-revenue').textContent = formatRupiah(s.revenue || 0);
    }
  } catch (err) { console.error('Stats error:', err); }
}

async function loadOrders(status = '') {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px;">
    <div class="spinner" style="margin: 0 auto;"></div></td></tr>`;

  try {
    const url = status ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders?limit=30`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger); padding: 20px;">
        ${data.message}</td></tr>`;
      return;
    }

    state.orders = data.data;

    if (state.orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-light); padding: 40px;">
        Belum ada pesanan</td></tr>`;
      return;
    }

    tbody.innerHTML = state.orders.map(order => `
      <tr>
        <td><strong>${order.order_number}</strong></td>
        <td>${order.customer_name}</td>
        <td>${order.table_number || '<span style="color:var(--text-light)">Takeaway</span>'}</td>
        <td style="max-width: 180px; font-size: 0.8rem; color: var(--text-light);">${order.items_summary || '-'}</td>
        <td><strong>${formatRupiah(order.total_amount)}</strong></td>
        <td>
          <span class="badge badge-${order.status}">${statusLabel(order.status)}</span><br>
          <span class="badge badge-${order.payment_status}" style="margin-top:4px;">${order.payment_status === 'paid' ? '✅ Lunas' : '⏳ Belum Bayar'}</span>
        </td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" onclick="showOrderDetail(${order.id})">👁️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">🗑️</button>
            ${renderStatusActions(order)}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger); padding: 20px;">
      Gagal memuat pesanan. Cek koneksi server.</td></tr>`;
  }
}

function renderStatusActions(order) {
  const actions = [];
  if (order.status === 'pending')
    actions.push(`<button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'confirmed')">✓ Konfirmasi</button>`);
  if (order.status === 'confirmed')
    actions.push(`<button class="btn btn-sm btn-primary" onclick="updateOrderStatus(${order.id}, 'preparing')">🍳 Proses</button>`);
  if (order.status === 'preparing')
    actions.push(`<button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'ready')">✅ Siap</button>`);
  if (order.payment_status === 'unpaid' && order.status !== 'cancelled')
    actions.push(`<button class="btn btn-sm" style="background: var(--gold); color: white;" onclick="markPaid(${order.id})">💰 Bayar</button>`);
  return actions.join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) { showToast(data.message, 'success'); loadOrders(); loadStats(); }
    else showToast(data.message, 'error');
  } catch (err) { showToast('Gagal memperbarui status', 'error'); }
}

async function markPaid(orderId) {
  const method = prompt('Metode pembayaran:\n1. cash\n2. transfer\n3. qris\nKetik salah satu:') || 'cash';
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
      body: JSON.stringify({ payment_status: 'paid', payment_method: method })
    });
    const data = await res.json();
    if (data.success) { showToast('Pembayaran dicatat ✅', 'success'); loadOrders(); loadStats(); }
    else showToast(data.message, 'error');
  } catch (err) { showToast('Gagal memperbarui pembayaran', 'error'); }
}
async function clearOrderHistory() {
  if (!state.token) {
    showToast('Silahkan login terlebih dahulu', 'error');
    return;
  }

  const confirmDelete = confirm(
    'Yakin ingin menghapus semua riwayat pesanan? Data pesanan yang sudah dihapus tidak bisa dikembalikan.'
  );
async function deleteOrder(orderId) {
  if (!state.token) {
    showToast('Silahkan login terlebih dahulu', 'error');
    return;
  }

  const confirmDelete = confirm('Yakin ingin menghapus pesanan ini?');

  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      showToast('Pesanan berhasil dihapus', 'success');
      loadDashboard();
    } else {
      showToast(data.message || 'Gagal menghapus pesanan', 'error');
    }
  } catch (err) {
    console.error('Delete order error:', err);
    showToast('Gagal menghapus pesanan', 'error');
  }
}
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_BASE}/orders/history/all`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      showToast('Riwayat pesanan berhasil dihapus', 'success');
      loadDashboard();
    } else {
      showToast(data.message || 'Gagal menghapus riwayat', 'error');
    }
  } catch (err) {
    console.error('Clear history error:', err);
    showToast('Gagal menghapus riwayat pesanan', 'error');
  }
}
async function showOrderDetail(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!data.success) { showToast('Gagal memuat detail', 'error'); return; }

    const order = data.data;
    const body = document.getElementById('order-detail-body');
    body.innerHTML = `
      <div style="margin-bottom:16px;">
        <div style="font-size:0.82rem; color: var(--text-light); margin-bottom: 4px;">Nomor Pesanan</div>
        <div style="font-size:1.1rem; font-weight:700; color: var(--brown-dark);">${order.order_number}</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; font-size:0.88rem;">
        <div><span style="color: var(--text-light);">Pelanggan:</span><br><strong>${order.customer_name}</strong></div>
        <div><span style="color: var(--text-light);">Meja:</span><br><strong>${order.table_number || 'Takeaway'}</strong></div>
        <div><span style="color: var(--text-light);">Status:</span><br><span class="badge badge-${order.status}">${statusLabel(order.status)}</span></div>
        <div><span style="color: var(--text-light);">Pembayaran:</span><br><span class="badge badge-${order.payment_status}">${order.payment_status === 'paid' ? '✅ Lunas' : '⏳ Belum'}</span></div>
      </div>
      <div style="font-weight:600; color:var(--brown-dark); margin-bottom:8px;">Item Pesanan:</div>
      <div class="order-detail-items">
        ${order.items?.map(item => `
          <div class="order-detail-item">
            <span>${item.item_name} x${item.quantity}</span>
            <span>${formatRupiah(item.subtotal)}</span>
          </div>
        `).join('') || 'Tidak ada item'}
      </div>
      ${order.notes ? `<div style="margin-top:12px; padding:10px; background:var(--cream-mid); border-radius:var(--radius-sm); font-size:0.85rem;">
        <strong>📝 Catatan:</strong> ${order.notes}</div>` : ''}
      <div class="cart-total-row" style="margin-top:12px;">
        <span class="cart-total-label">Total</span>
        <span class="cart-total-amount">${formatRupiah(order.total_amount)}</span>
      </div>
    `;

    document.getElementById('order-detail-modal').classList.add('open');
  } catch (err) { showToast('Gagal memuat detail pesanan', 'error'); }
}

// ============ ADMIN MENU MANAGEMENT ============
async function loadAdminMenu() {
  const grid = document.getElementById('admin-menu-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const res = await fetch(`${API_BASE}/menu`);
    const data = await res.json();
    state.menuItems = data.data || [];
    renderAdminMenuGrid();
  } catch (err) {
    grid.innerHTML = '<p style="padding:20px; color:var(--danger);">Gagal memuat data menu</p>';
  }
}

function renderAdminMenuGrid() {
  const grid = document.getElementById('admin-menu-grid');
  if (!grid) return;

  grid.innerHTML = state.menuItems.map(item => `
    <div class="admin-menu-card fade-in">
      <img src="${item.image_url || ''}" alt="${item.name}"
           onerror="this.src='https://via.placeholder.com/240x140?text=Menu'">
      <div class="admin-card-body">
        <div class="admin-card-name">${item.name}</div>
        <div style="font-size:0.75rem; color:var(--text-light); margin-bottom:4px;">${item.category_name}</div>
        <div class="admin-card-price">${formatRupiah(item.price)}</div>
        <div style="margin-bottom:8px;">
          <span class="badge ${item.is_available ? 'badge-ready' : 'badge-cancelled'}">
            ${item.is_available ? '✅ Tersedia' : '❌ Tidak Tersedia'}
          </span>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-sm btn-outline" onclick="openEditMenu(${item.id})">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMenu(${item.id})">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddMenu() {
  document.getElementById('menu-form-title').textContent = 'Tambah Menu Baru';
  document.getElementById('menu-form').reset();
  document.getElementById('edit-menu-id').value = '';
  document.getElementById('add-menu-modal').classList.add('open');
}

async function openEditMenu(id) {
  const item = state.menuItems.find(m => m.id == id);
  if (!item) return;

  document.getElementById('menu-form-title').textContent = 'Edit Menu';
  document.getElementById('edit-menu-id').value = item.id;
  document.getElementById('edit-category').value = item.category_id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-description').value = item.description || '';
  document.getElementById('edit-price').value = item.price;
  document.getElementById('edit-image-url').value = item.image_url || '';
  document.getElementById('edit-available').value = item.is_available ? '1' : '0';

  document.getElementById('add-menu-modal').classList.add('open');
}

async function saveMenu() {
  const id = document.getElementById('edit-menu-id').value;
  const payload = {
    category_id: document.getElementById('edit-category').value,
    name: document.getElementById('edit-name').value.trim(),
    description: document.getElementById('edit-description').value.trim(),
    price: parseFloat(document.getElementById('edit-price').value),
    image_url: document.getElementById('edit-image-url').value.trim(),
    is_available: document.getElementById('edit-available').value === '1'
  };

  if (!payload.category_id || !payload.name || !payload.price) {
    showToast('Kategori, nama, dan harga wajib diisi', 'error');
    return;
  }

  try {
    const url = id ? `${API_BASE}/menu/${id}` : `${API_BASE}/menu`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast(id ? 'Menu berhasil diperbarui' : 'Menu berhasil ditambahkan', 'success');
      closeModal('add-menu-modal');
      loadAdminMenu();
    } else showToast(data.message, 'error');
  } catch (err) { showToast('Gagal menyimpan menu', 'error'); }
}

async function deleteMenu(id) {
  if (!confirm('Yakin ingin menghapus menu ini?')) return;
  try {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) { showToast('Menu dihapus', 'success'); loadAdminMenu(); }
    else showToast(data.message, 'error');
  } catch (err) { showToast('Gagal menghapus menu', 'error'); }
}

// ============ HELPERS ============
function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function statusLabel(status) {
  const labels = {
    pending: '⏳ Menunggu',
    confirmed: '✅ Dikonfirmasi',
    preparing: '🍳 Diproses',
    ready: '🔔 Siap',
    completed: '✔️ Selesai',
    cancelled: '❌ Dibatalkan'
  };
  return labels[status] || status;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker failed:', err));
}
