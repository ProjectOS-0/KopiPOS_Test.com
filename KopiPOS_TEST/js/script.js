// TANGGAL HARI INI

const currentDate = document.getElementById("current-date");

if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// NAVIGASI HALAMAN

const navItems = document.querySelectorAll(".nav-item");

function navigateTo(page) {

    // Menghapus status aktif
    navItems.forEach(item => {
        item.classList.remove("active");
    });

    // Mengaktifkan menu yang dipilih
    const selectedMenu = document.querySelector(
        `.nav-item[data-page="${page}"]`
    );

    if (selectedMenu) {
        selectedMenu.classList.add("active");
    }

    // Menampilkan halaman
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const selectedPage = document.getElementById(page);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Mengubah judul halaman
    const title = selectedMenu
        ? selectedMenu.textContent.trim()
        : "Dashboard";

    document.getElementById("page-title").textContent = title;
    document.getElementById("breadcrumb").textContent = title;
}


// EVENT KLIK MENU

navItems.forEach(item => {

    item.addEventListener("click", function() {

        const page = this.dataset.page;

        navigateTo(page);

    });

});

// ======================================
// KOPIPOS - CASHIER SYSTEM
// ======================================


// DATA MENU SEMENTARA

const products = [
    {
        id: "M001",
        name: "Americano",
        category: "Coffee",
        price: 15000,
        icon: "☕"
    },
    {
        id: "M002",
        name: "Cafe Latte",
        category: "Coffee",
        price: 20000,
        icon: "🥛"
    },
    {
        id: "M003",
        name: "Cappuccino",
        category: "Coffee",
        price: 18000,
        icon: "☕"
    },
    {
        id: "M004",
        name: "Kopi Susu Aren",
        category: "Coffee",
        price: 18000,
        icon: "🧋"
    },
    {
        id: "M005",
        name: "Matcha Latte",
        category: "Non Coffee",
        price: 20000,
        icon: "🍵"
    },
    {
        id: "M006",
        name: "Chocolate",
        category: "Non Coffee",
        price: 18000,
        icon: "🍫"
    },
    {
        id: "M007",
        name: "Red Velvet",
        category: "Non Coffee",
        price: 20000,
        icon: "🥤"
    },
    {
        id: "M008",
        name: "Vanilla Latte",
        category: "Coffee",
        price: 22000,
        icon: "☕"
    },
    {
        id: "M009",
        name: "Caramel Latte",
        category: "Coffee",
        price: 23000,
        icon: "🥤"
    }
];
// ======================================
// KOPIPOS - LOAD MENU DARI GOOGLE SHEETS
// ======================================

const API_URL = "https://script.google.com/macros/s/AKfycbz_Hv3OfJfvoaRSlsxNTJZ-J5titZOZl2bdKNnH0o97Yw4_LECX5ymFmSZtSbeAfX8TXQ/exec";

async function loadMenuFromAPI() {
    try {
        console.log("Mengambil data menu dari Google Spreadsheet...");

        const response = await fetch(`${API_URL}?action=getMenu`);

        if (!response.ok) {
            throw new Error("Gagal menghubungi API.");
        }

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message || "Gagal mengambil data menu.");
        }

        const apiProducts = result.data
            .filter(item => item.status.toLowerCase() === "aktif")
            .map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: Number(item.price),
                icon: item.category.toLowerCase() === "coffee"
                    ? "☕"
                    : "🥤"
            }));

        // Perbarui daftar produk
        products.splice(0, products.length, ...apiProducts);

        // Tampilkan produk terbaru
        renderProducts();

        console.log("Menu berhasil dimuat:", apiProducts);

    } catch (error) {
        console.error("Gagal memuat menu:", error);

        alert(
            "Menu dari Google Spreadsheet gagal dimuat. " +
            "Silakan periksa koneksi API."
        );
    }
}


// KERANJANG

let cart = [];


// FORMAT RUPIAH

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}


// MENAMPILKAN TANGGAL KASIR

const cashierDate = document.getElementById("cashier-date");

if (cashierDate) {
    cashierDate.textContent = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// MENAMPILKAN PRODUK

function renderProducts() {

    const productGrid = document.getElementById("product-grid");

    if (!productGrid) return;

    const search = document.getElementById("search-product").value
        .toLowerCase();

    const category = document.getElementById("filter-category").value;

    const filteredProducts = products.filter(product => {

        const matchName = product.name.toLowerCase().includes(search);

        const matchCategory =
            category === "Semua" || product.category === category;

        return matchName && matchCategory;

    });


    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <div class="no-product">
                Menu tidak ditemukan.
            </div>
        `;

        return;
    }


    productGrid.innerHTML = filteredProducts.map(product => `

        <div class="product-card"
             onclick="addToCart('${product.id}')">

            <div class="product-image">
                ${product.icon}
            </div>

            <h4>${product.name}</h4>

            <p class="product-category">
                ${product.category}
            </p>

            <div class="product-bottom">

                <span class="product-price">
                    ${formatRupiah(product.price)}
                </span>

                <button class="add-product" type="button">
                    +
                </button>

            </div>

        </div>

    `).join("");

}


// MENAMBAHKAN PRODUK KE KERANJANG

function addToCart(productId) {

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {

        existingProduct.qty++;

    } else {

        cart.push({
            ...product,
            qty: 1
        });

    }

    renderCart();

}


// MENGHITUNG TOTAL

function calculateTotal() {

    return cart.reduce((total, item) => {

        return total + (item.price * item.qty);

    }, 0);

}


// MENGHITUNG JUMLAH ITEM

function calculateItems() {

    return cart.reduce((total, item) => {

        return total + item.qty;

    }, 0);

}


// MENAMPILKAN KERANJANG

function renderCart() {

    const cartItems = document.getElementById("cart-items");

    if (!cartItems) return;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Belum ada pesanan</p>
            </div>
        `;

    } else {

        cartItems.innerHTML = cart.map(item => `

            <div class="cart-item">

                <div class="cart-item-info">

                    <h4>${item.name}</h4>

                    <p>${formatRupiah(item.price * item.qty)}</p>

                </div>

                <div class="quantity-control">

                    <button onclick="changeQuantity('${item.id}', -1)">
                        -
                    </button>

                    <span>${item.qty}</span>

                    <button onclick="changeQuantity('${item.id}', 1)">
                        +
                    </button>

                </div>

            </div>

        `).join("");

    }


    document.getElementById("cart-total-items").textContent =
        calculateItems();

    document.getElementById("cart-total").textContent =
        formatRupiah(calculateTotal());

    calculateChange();

}


// MENGUBAH JUMLAH PRODUK

function changeQuantity(productId, change) {

    const item = cart.find(product => product.id === productId);

    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {

        cart = cart.filter(product => product.id !== productId);

    }

    renderCart();

}


// MENGHAPUS SEMUA KERANJANG

function clearCart() {

    if (cart.length === 0) return;

    const confirmClear = confirm(
        "Apakah kamu yakin ingin menghapus semua pesanan?"
    );

    if (!confirmClear) return;

    cart = [];

    document.getElementById("payment-amount").value = "";

    renderCart();

}


// MENGHITUNG KEMBALIAN

function calculateChange() {

    const total = calculateTotal();

    const paymentInput = document.getElementById("payment-amount");

    const payment = Number(paymentInput.value) || 0;

    const change = payment - total;

    document.getElementById("change-amount").textContent =
        formatRupiah(Math.max(0, change));

    const checkoutButton = document.getElementById("checkout-button");

    checkoutButton.disabled =
        cart.length === 0 || payment < total || total <= 0;

}


// EVENT INPUT PEMBAYARAN

const paymentInput = document.getElementById("payment-amount");

if (paymentInput) {

    paymentInput.addEventListener("input", calculateChange);

}


// PENCARIAN PRODUK

const searchProduct = document.getElementById("search-product");

if (searchProduct) {

    searchProduct.addEventListener("input", renderProducts);

}


// FILTER KATEGORI

const filterCategory = document.getElementById("filter-category");

if (filterCategory) {

    filterCategory.addEventListener("change", renderProducts);

}


// MENYELESAIKAN TRANSAKSI

// ======================================
// CHECKOUT KOPIPOS - GOOGLE SPREADSHEET
// ======================================

async function checkout() {

    const total = calculateTotal();

    const payment = Number(
        document.getElementById("payment-amount").value
    ) || 0;

    // Validasi keranjang
    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    // Validasi pembayaran
    if (payment < total) {
        alert("Uang pembayaran masih kurang!");
        return;
    }

    // Buat data transaksi
    const transaction = {

        id: "TRX" + Date.now(),

        date: new Date().toISOString(),

        items: cart.map(item => ({

            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            subtotal: item.price * item.qty

        })),

        total: total,

        payment: payment,

        change: payment - total,

        cashier: (
    JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    ).cashierName || "Admin"
)

    };

    // Ambil tombol checkout
    const checkoutButton = document.getElementById(
        "checkout-button"
    );

    try {

        // Nonaktifkan tombol selama proses
        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.textContent = "Menyimpan...";
        }

        console.log("Mengirim transaksi ke Google Spreadsheet...");

        // Kirim transaksi ke Google Apps Script
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({

                action: "saveTransaction",

                data: transaction

            })

        });

        const result = await response.json();

        // Periksa respons API
        if (
            !response.ok ||
            result.status !== "success"
        ) {

            throw new Error(
                result.message || "Transaksi gagal disimpan."
            );

        }

        // Simpan riwayat di browser setelah API berhasil
        const transactions = JSON.parse(
            localStorage.getItem("kopipos_transactions") || "[]"
        );

        transactions.push(transaction);

        localStorage.setItem(
            "kopipos_transactions",
            JSON.stringify(transactions)
        );

        // Tampilkan notifikasi
        alert(
            
            "TRANSAKSI BERHASIL!\n\n" +
            "ID: " + transaction.id + "\n" +
            "Total: " + formatRupiah(total) + "\n" +
            "Bayar: " + formatRupiah(payment) + "\n" +
            "Kembalian: " + formatRupiah(payment - total) +
            "\n\nData berhasil disimpan ke Google Spreadsheet."
        );

        // Cetak struk transaksi
        printReceipt(transaction);

        // Reset keranjang
        cart = [];

        document.getElementById("payment-amount").value = "";

        renderCart();

        console.log("Transaksi berhasil:", result);

    } catch (error) {

        console.error("Checkout error:", error);

        alert(
            "TRANSAKSI GAGAL DISIMPAN!\n\n" +
            error.message +
            "\n\nSilakan periksa koneksi API dan coba kembali."
        );

    } finally {

        // Aktifkan kembali tombol
        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Bayar";
        }

    }

}

// ======================================
// KOPIPOS - CETAK STRUK
// ======================================

function printReceipt(transaction) {

    const receiptContent = document.getElementById("receipt-content");

    if (!receiptContent) return;

    // Ambil pengaturan kedai
    const settings = JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    );

    const storeName = settings.storeName || "KOPIPOS COFFEE";
    const storeAddress = settings.storeAddress || "";
    const storePhone = settings.storePhone || "";
    const cashierName = settings.cashierName || "Admin";
    const receiptMessage = settings.receiptMessage || "Terima kasih telah berkunjung!";
    const storeLogo = localStorage.getItem("kopipos_logo") || "";

    // Daftar menu
    const itemsHTML = transaction.items.map(item => `

        <div class="receipt-item">

            <div>
                <strong>${item.name}</strong>
                <br>
                ${item.qty} x ${formatRupiah(item.price)}
            </div>

            <strong>${formatRupiah(item.subtotal)}</strong>

        </div>

    `).join("");

    // Isi struk
    receiptContent.innerHTML = `

        <div style="text-align:center;">

    ${storeLogo ? `
        <div style="margin-bottom:10px;">
            <img
                src="${storeLogo}"
                alt="Logo Kedai"
                style="
                    max-width:100px;
                    max-height:80px;
                    object-fit:contain;
                "
            >
        </div>
    ` : ""}

    <h2>${storeName}</h2>

            ${storeAddress ? `<p>${storeAddress}</p>` : ""}

            ${storePhone ? `<p>WhatsApp: ${storePhone}</p>` : ""}

        </div>

        <hr>

        <p>ID Transaksi: ${transaction.id}</p>

        <p>
            Tanggal:
            ${formatTransactionDate(transaction.date)}
        </p>

        <p>Kasir: ${cashierName}</p>

        <hr>

        ${itemsHTML}

        <hr>

        <div class="receipt-item">
            <strong>Total</strong>
            <strong>${formatRupiah(transaction.total)}</strong>
        </div>

        <div class="receipt-item">
            <span>Bayar</span>
            <span>${formatRupiah(transaction.payment)}</span>
        </div>

        <div class="receipt-item">
            <strong>Kembalian</strong>
            <strong>${formatRupiah(transaction.change)}</strong>
        </div>

        <hr>

        <p style="text-align:center;">
            ${receiptMessage}
        </p>

    `;

    const receiptContainer = document.getElementById("receipt-container");

    receiptContainer.style.display = "block";

    window.print();

    receiptContainer.style.display = "none";

}

// INISIALISASI KASIR

renderProducts();

renderCart();

// ======================================
// KOPIPOS - MENU MANAGEMENT
// GOOGLE SPREADSHEET API
// ======================================

const menuStorageKey = "kopipos_menu";

let menuData = [];

// GENERATE ID MENU OTOMATIS
function generateNextMenuId() {
    let highestNumber = 0;

    menuData.forEach(menu => {
        const match = String(menu.id).match(/^M(\d+)$/);

        if (match) {
            const number = parseInt(match[1], 10);

            if (number > highestNumber) {
                highestNumber = number;
            }
        }
    });

    return "M" + String(highestNumber + 1).padStart(3, "0");
}


// ======================================
// FUNGSI SINKRONISASI PRODUK KASIR
// ======================================

function syncMenuToCashier() {

    const availableProducts = menuData
        .filter(menu => menu.status === "Tersedia")
        .map(menu => ({
            id: menu.id,
            name: menu.name,
            category: menu.category,
            price: Number(menu.price),
            icon: menu.icon || "☕"
        }));

    products.splice(
        0,
        products.length,
        ...availableProducts
    );

    if (typeof renderProducts === "function") {
        renderProducts();
    }
}


// ======================================
// SIMPAN MENU KE LOCAL STORAGE
// ======================================

function saveMenuData() {

    localStorage.setItem(
        menuStorageKey,
        JSON.stringify(menuData)
    );

    syncMenuToCashier();

    renderMenuTable();

    renderMenuStatistics();
}


// ======================================
// LOAD MENU DARI GOOGLE SPREADSHEET
// ======================================

async function loadMenuManagementFromAPI() {

    try {

        console.log("Mengambil data menu...");

        const response = await fetch(
            `${API_URL}?action=getMenu`
        );

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message);
        }

        menuData = result.data.map(menu => ({

            id: menu.id,

            name: menu.name,

            category: menu.category,

            price: Number(menu.price),

            status: menu.status.toLowerCase() === "aktif"
                ? "Tersedia"
                : "Tidak Tersedia",

            icon: menu.category.toLowerCase() === "coffee"
                ? "☕"
                : "🥤"

        }));

        saveMenuData();

        console.log("Menu berhasil dimuat:", menuData);

    } catch (error) {

        console.error("Gagal mengambil menu:", error);

        alert(
            "Gagal mengambil data menu dari Google Spreadsheet."
        );

    }

}


// ======================================
// KIRIM DATA MENU KE API
// ======================================

async function sendMenuToAPI(action, data) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify({

            action: action,

            data: data

        })

    });

    const result = await response.json();

    if (
        !response.ok ||
        result.status !== "success"
    ) {

        throw new Error(
            result.message || "Gagal menyimpan data menu."
        );

    }

    return result;

}


// ======================================
// MENCEGAH HTML INJECTION
// ======================================

function escapeMenuHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}


// ======================================
// STATISTIK MENU
// ======================================

function renderMenuStatistics() {

    const total = menuData.length;

    const available = menuData.filter(
        menu => menu.status === "Tersedia"
    ).length;

    const unavailable = total - available;

    document.getElementById("menu-total").textContent = total;

    document.getElementById("menu-available").textContent = available;

    document.getElementById("menu-unavailable").textContent = unavailable;

}


// ======================================
// TABEL MENU
// ======================================

function renderMenuTable() {

    const tableBody = document.getElementById("menu-table-body");

    if (!tableBody) return;

    const searchElement = document.getElementById("search-menu");

    const categoryElement = document.getElementById(
        "filter-menu-category"
    );

    const keyword = searchElement.value.toLowerCase();

    const category = categoryElement.value;

    const filteredMenus = menuData.filter(menu => {

        const matchName = menu.name
            .toLowerCase()
            .includes(keyword);

        const matchCategory =
            category === "Semua" ||
            menu.category === category;

        return matchName && matchCategory;

    });


    if (filteredMenus.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px;">
                    Tidak ada menu ditemukan.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = filteredMenus.map((menu, index) => {

        const statusClass = menu.status === "Tersedia"
            ? "status-available"
            : "status-unavailable";

        return `

            <tr>

                <td>${index + 1}</td>

                <td>${escapeMenuHTML(menu.name)}</td>

                <td>${escapeMenuHTML(menu.category)}</td>

                <td>${formatRupiah(Number(menu.price))}</td>

                <td>
                    <span class="menu-status ${statusClass}">
                        ${escapeMenuHTML(menu.status)}
                    </span>
                </td>

                <td>

                    <div class="menu-action">

                        <button
                            class="edit-menu-button"
                            onclick="editMenu('${escapeMenuHTML(menu.id)}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-menu-button"
                            onclick="deleteMenu('${escapeMenuHTML(menu.id)}')"
                        >
                            Hapus
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");

}


// ======================================
// BUKA MODAL TAMBAH MENU
// ======================================

function openMenuModal() {

    document.getElementById("menu-form").reset();

    document.getElementById("menu-id").value = generateNextMenuId();

    document.getElementById("menu-modal-title").textContent =
        "Tambah Menu";

    document.getElementById("menu-modal").classList.add("active");

}


// ======================================
// TUTUP MODAL
// ======================================

function closeMenuModal() {

    document.getElementById("menu-modal").classList.remove("active");

}


// ======================================
// TAMBAH DAN EDIT MENU
// ======================================

document.getElementById("menu-form").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const menuId = document.getElementById("menu-id")
    .value.trim() || generateNextMenuId();

        const name = document.getElementById("menu-name")
            .value.trim();

        const category = document.getElementById("menu-category")
            .value;

        const price = Number(
            document.getElementById("menu-price").value
        );

        const status = document.getElementById("menu-status")
            .value;


        if (!name || !Number.isFinite(price) || price <= 0) {

            alert("Nama dan harga menu harus diisi dengan benar.");

            return;

        }


        

        const menu = {

            id: menuId,

            name: name,

            category: category,

            price: price,

            // Sesuaikan status website dengan status API
            status: status === "Tersedia"
                ? "Aktif"
                : "Tidak Aktif"

        };


        const submitButton = event.submitter;

        try {

            if (submitButton) {
                submitButton.disabled = true;
            }

            // Simpan ke Google Spreadsheet
            await sendMenuToAPI("saveMenu", menu);

            // Perbarui data lokal
            const index = menuData.findIndex(
                item => item.id === menuId
            );

            const updatedMenu = {
                ...menu,
                status: status,
                icon: category.toLowerCase() === "coffee"
                    ? "☕"
                    : "🥤"
            };

            if (index !== -1) {

                menuData[index] = updatedMenu;

            } else {

                menuData.push(updatedMenu);

            }

            saveMenuData();

            closeMenuModal();

            alert("Menu berhasil disimpan ke Google Spreadsheet.");

        } catch (error) {

            console.error("Gagal menyimpan menu:", error);

            alert(
                "Gagal menyimpan menu!\n\n" +
                error.message
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    }
);


// ======================================
// EDIT MENU
// ======================================

function editMenu(id) {

    const menu = menuData.find(
        item => item.id === id
    );

    if (!menu) return;

    document.getElementById("menu-id").value = menu.id;

    document.getElementById("menu-name").value = menu.name;

    document.getElementById("menu-category").value = menu.category;

    document.getElementById("menu-price").value = menu.price;

    document.getElementById("menu-status").value = menu.status;

    document.getElementById("menu-modal-title").textContent =
        "Edit Menu";

    document.getElementById("menu-modal").classList.add("active");

}


// ======================================
// HAPUS MENU
// ======================================

async function deleteMenu(id) {

    const menu = menuData.find(
        item => item.id === id
    );

    if (!menu) return;

    const confirmation = confirm(
        `Apakah Anda yakin ingin menghapus menu ${menu.name}?`
    );

    if (!confirmation) return;


    try {

        // Hapus dari Google Spreadsheet
        await sendMenuToAPI("deleteMenu", {
            id: id
        });

        // Hapus dari data lokal
        menuData = menuData.filter(
            item => item.id !== id
        );

        saveMenuData();

        alert("Menu berhasil dihapus dari Google Spreadsheet.");

    } catch (error) {

        console.error("Gagal menghapus menu:", error);

        alert(
            "Gagal menghapus menu!\n\n" +
            error.message
        );

    }

}


// ======================================
// PENCARIAN MENU
// ======================================

document.getElementById("search-menu").addEventListener(
    "input",
    renderMenuTable
);


// ======================================
// FILTER KATEGORI
// ======================================

document.getElementById("filter-menu-category").addEventListener(
    "change",
    renderMenuTable
);


// ======================================
// INISIALISASI MENU
// ======================================

// Ambil menu langsung dari Google Spreadsheet
loadMenuManagementFromAPI();


// ======================================
// KOPIPOS - RIWAYAT TRANSAKSI
// ======================================

// Mengambil data transaksi dari localStorage
function getTransactionHistory() {

    try {
        const savedTransactions = localStorage.getItem(
            "kopipos_transactions"
        );

        const transactions = savedTransactions
            ? JSON.parse(savedTransactions)
            : [];

        return Array.isArray(transactions) ? transactions : [];

    } catch (error) {
        console.error("Gagal membaca riwayat transaksi:", error);
        return [];
    }
}


// Format tanggal Indonesia
function formatTransactionDate(dateValue) {

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// Mengubah tanggal menjadi YYYY-MM-DD
function getLocalDate(dateValue) {

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Mencegah teks dianggap sebagai HTML
function escapeHistoryHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}


// Menampilkan statistik transaksi
function renderHistoryStatistics() {

    const transactions = getTransactionHistory();

    const totalTransactions = transactions.length;

    const totalSales = transactions.reduce(
        (total, transaction) => total + Number(transaction.total || 0),
        0
    );

    const averageSales = totalTransactions > 0
        ? totalSales / totalTransactions
        : 0;

    document.getElementById(
        "history-total-transactions"
    ).textContent = totalTransactions;

    document.getElementById(
        "history-total-sales"
    ).textContent = formatRupiah(totalSales);

    document.getElementById(
        "history-average-sales"
    ).textContent = formatRupiah(averageSales);

}


// Menampilkan tabel transaksi
function renderTransactionHistory() {

    const tableBody = document.getElementById(
        "history-table-body"
    );

    if (!tableBody) return;

    const transactions = getTransactionHistory();

    const keyword = document.getElementById(
        "search-transaction"
    ).value.trim().toLowerCase();

    const selectedDate = document.getElementById(
        "filter-transaction-date"
    ).value;

    const filteredTransactions = transactions
        .filter(transaction => {

            const matchID = String(transaction.id || "")
                .toLowerCase()
                .includes(keyword);

            const matchDate = selectedDate === "" ||
                getLocalDate(transaction.date) === selectedDate;

            return matchID && matchDate;

        })
        .sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });


    if (filteredTransactions.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="history-empty">
                        Belum ada transaksi ditemukan.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = filteredTransactions.map(
        (transaction, index) => {

            const totalItems = (transaction.items || []).reduce(
                (total, item) => total + Number(item.qty || 0),
                0
            );

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${escapeHistoryHTML(transaction.id)}
                    </td>

                    <td>
                        ${escapeHistoryHTML(
                            formatTransactionDate(transaction.date)
                        )}
                    </td>

                    <td>${totalItems}</td>

                    <td>
                        ${formatRupiah(Number(transaction.total || 0))}
                    </td>

                    <td>
                        ${formatRupiah(Number(transaction.payment || 0))}
                    </td>

                    <td>
                        ${formatRupiah(Number(transaction.change || 0))}
                    </td>

                    <td>
                        ${escapeHistoryHTML(transaction.cashier || "Admin")}
                    </td>

                    <td>
                        <button
                            class="detail-transaction-button"
                            onclick="showTransactionDetail('${escapeHistoryHTML(transaction.id)}')"
                        >
                            Detail
                        </button>
                    </td>

                </tr>
            `;

        }
    ).join("");

}


// Membuka detail transaksi
function showTransactionDetail(id) {

    const transactions = getTransactionHistory();

    const transaction = transactions.find(
        item => String(item.id) === String(id)
    );

    if (!transaction) {
        alert("Transaksi tidak ditemukan.");
        return;
    }

    const detailContent = document.getElementById(
        "history-detail-content"
    );

    const items = transaction.items || [];

    const itemHTML = items.map(item => {

        const name = escapeHistoryHTML(item.name || "-");
        const qty = Number(item.qty || 0);
        const subtotal = Number(
            item.subtotal || Number(item.price || 0) * qty
        );

        return `
            <div class="history-item">

                <span>
                    ${name} × ${qty}
                </span>

                <strong>
                    ${formatRupiah(subtotal)}
                </strong>

            </div>
        `;

    }).join("");


    detailContent.innerHTML = `

        <div class="history-detail-row">
            <span>ID Transaksi</span>
            <strong>${escapeHistoryHTML(transaction.id)}</strong>
        </div>

        <div class="history-detail-row">
            <span>Tanggal</span>
            <strong>
                ${escapeHistoryHTML(
                    formatTransactionDate(transaction.date)
                )}
            </strong>
        </div>

        <div class="history-detail-row">
            <span>Nama Kasir</span>
            <strong>
                 ${escapeHistoryHTML(transaction.cashier || "Admin")}
             </strong>
        </div>

        <div class="history-detail-items">

            <h4>Daftar Pesanan</h4>

            ${itemHTML || '<p class="history-empty">Tidak ada detail pesanan.</p>'}

        </div>

        <br>

        <div class="history-detail-row">
            <span>Total Pembayaran</span>
            <strong>${formatRupiah(Number(transaction.total || 0))}</strong>
        </div>

        <div class="history-detail-row">
            <span>Uang Diterima</span>
            <strong>${formatRupiah(Number(transaction.payment || 0))}</strong>
        </div>

        <div class="history-detail-row">
            <span>Kembalian</span>
            <strong>${formatRupiah(Number(transaction.change || 0))}</strong>
        </div>

    `;

    document.getElementById(
        "history-modal"
    ).classList.add("active");

}


// Menutup detail transaksi
function closeHistoryModal() {

    document.getElementById(
        "history-modal"
    ).classList.remove("active");

}


// Reset pencarian dan filter
function resetHistoryFilter() {

    document.getElementById(
        "search-transaction"
    ).value = "";

    document.getElementById(
        "filter-transaction-date"
    ).value = "";

    renderTransactionHistory();

}


// Event pencarian transaksi
document.getElementById(
    "search-transaction"
).addEventListener("input", renderTransactionHistory);


// Event filter tanggal
document.getElementById(
    "filter-transaction-date"
).addEventListener("change", renderTransactionHistory);


// Memperbarui riwayat ketika halaman dibuka
const originalNavigateTo = navigateTo;

navigateTo = function(page) {

    originalNavigateTo(page);

    if (page === "riwayat") {
        renderHistoryStatistics();
        renderTransactionHistory();
    }

};


// Inisialisasi awal
renderHistoryStatistics();
renderTransactionHistory();

// ======================================
// KOPIPOS - LAPORAN PENJUALAN
// ======================================

let salesReportChart = null;


// Mengambil transaksi berdasarkan periode
function getFilteredReportTransactions() {

    const transactions = getTransactionHistory();

    const period = document.getElementById(
        "report-period"
    ).value;

    const now = new Date();

    return transactions.filter(transaction => {

        const transactionDate = new Date(transaction.date);

        if (isNaN(transactionDate.getTime())) {
            return false;
        }

        if (period === "semua") {
            return true;
        }

        if (period === "hari") {

            return getLocalDate(transactionDate) ===
                getLocalDate(now);

        }

        if (period === "minggu") {

            const startDate = new Date(now);

            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 6);

            return transactionDate >= startDate &&
                transactionDate <= now;

        }

        if (period === "bulan") {

            return transactionDate.getMonth() === now.getMonth() &&
                transactionDate.getFullYear() === now.getFullYear();

        }

        return true;

    });

}


// Menghitung ringkasan laporan
function renderReportStatistics(transactions) {

    const totalTransactions = transactions.length;

    const totalSales = transactions.reduce(
        (sum, transaction) => {
            return sum + Number(transaction.total || 0);
        },
        0
    );

    const totalItems = transactions.reduce(
        (sum, transaction) => {

            const items = transaction.items || [];

            return sum + items.reduce(
                (itemSum, item) => {
                    return itemSum + Number(item.qty || 0);
                },
                0
            );

        },
        0
    );

    const averageSales = totalTransactions > 0
        ? totalSales / totalTransactions
        : 0;


    document.getElementById(
        "report-total-sales"
    ).textContent = formatRupiah(totalSales);

    document.getElementById(
        "report-total-transactions"
    ).textContent = totalTransactions;

    document.getElementById(
        "report-average-sales"
    ).textContent = formatRupiah(averageSales);

    document.getElementById(
        "report-total-items"
    ).textContent = totalItems;

}


// Mengelompokkan penjualan berdasarkan tanggal
function getSalesByDate(transactions) {

    const salesMap = {};

    transactions.forEach(transaction => {

        const date = getLocalDate(transaction.date);

        if (!date) return;

        if (!salesMap[date]) {
            salesMap[date] = 0;
        }

        salesMap[date] += Number(transaction.total || 0);

    });

    return Object.entries(salesMap)
        .sort((a, b) => a[0].localeCompare(b[0]));

}


// Membuat grafik penjualan
function renderSalesChart(transactions) {

    const canvas = document.getElementById(
        "sales-report-chart"
    );

    if (!canvas) return;

    const salesData = getSalesByDate(transactions);

    const labels = salesData.map(item => {

        const date = new Date(item[0] + "T00:00:00");

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short"
        });

    });

    const values = salesData.map(item => item[1]);

    if (salesReportChart) {
        salesReportChart.destroy();
    }

    if (typeof Chart === "undefined") {

        console.error("Chart.js belum berhasil dimuat.");
        return;

    }

    salesReportChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{
                label: "Total Penjualan",

                data: values,

                borderColor: "#d6a75c",

                backgroundColor: "rgba(214, 167, 92, 0.12)",

                borderWidth: 3,

                fill: true,

                tension: 0.35,

                pointRadius: 4,

                pointBackgroundColor: "#d6a75c"
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    labels: {
                        color: "#e6d8c6"
                    }
                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#a99a88"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#a99a88",

                        callback: function(value) {
                            return "Rp" + Number(value).toLocaleString("id-ID");
                        }

                    },

                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }

                }

            }

        }

    });

}


// Menghitung menu terlaris
function renderBestSellingReport(transactions) {

    const tableBody = document.getElementById(
        "best-selling-report"
    );

    if (!tableBody) return;

    const productMap = {};

    transactions.forEach(transaction => {

        const items = transaction.items || [];

        items.forEach(item => {

            const name = item.name || "Menu tidak diketahui";

            if (!productMap[name]) {

                productMap[name] = {
                    name: name,
                    qty: 0,
                    total: 0
                };

            }

            productMap[name].qty += Number(item.qty || 0);

            productMap[name].total += Number(
                item.subtotal ||
                Number(item.price || 0) * Number(item.qty || 0)
            );

        });

    });


    const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.qty - a.qty);


    if (sortedProducts.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Belum ada data penjualan.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = sortedProducts.map(
        (product, index) => {

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>${escapeHistoryHTML(product.name)}</td>

                    <td>${product.qty}</td>

                    <td>${formatRupiah(product.total)}</td>

                </tr>
            `;

        }
    ).join("");

}


// Fungsi utama laporan
function renderSalesReport() {

    const transactions = getFilteredReportTransactions();

    renderReportStatistics(transactions);

    renderSalesChart(transactions);

    renderBestSellingReport(transactions);

}


// Memperbarui laporan ketika halaman dibuka
const previousNavigateTo = navigateTo;

navigateTo = function(page) {

    previousNavigateTo(page);

    if (page === "laporan") {
        renderSalesReport();
    }

};


// Event filter periode
document.getElementById(
    "report-period"
).addEventListener("change", renderSalesReport);


// Inisialisasi laporan
renderSalesReport();
// Muat menu dari Google Spreadsheet
loadMenuFromAPI();

// ======================================
// KOPIPOS - DASHBOARD
// ======================================

function renderDashboard() {

    const transactions = JSON.parse(
        localStorage.getItem("kopipos_transactions") || "[]"
    );

    const now = new Date();

    const today = now.toLocaleDateString("id-ID");

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // TRANSAKSI HARI INI
    const todayTransactions = transactions.filter(transaction => {

        const transactionDate = new Date(transaction.date);

        return transactionDate.toLocaleDateString("id-ID") === today;

    });

    // TOTAL PENJUALAN HARI INI
    const todaySales = todayTransactions.reduce(
        (total, transaction) => total + Number(transaction.total || 0),
        0
    );

    // TOTAL TRANSAKSI
    const totalTransactions = todayTransactions.length;

    // PRODUK TERJUAL
    const totalProducts = todayTransactions.reduce(
        (total, transaction) => {
            return total + (transaction.items || []).reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0
            );
        },
        0
    );

    // PENJUALAN BULAN INI
    const monthlySales = transactions
        .filter(transaction => {

            const date = new Date(transaction.date);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        })
        .reduce(
            (total, transaction) => total + Number(transaction.total || 0),
            0
        );

    // TAMPILKAN STATISTIK
    document.getElementById("total-sales").textContent =
        formatRupiah(todaySales);

    document.getElementById("total-transactions").textContent =
        totalTransactions;

    document.getElementById("total-products").textContent =
        totalProducts;

    document.getElementById("monthly-sales").textContent =
        formatRupiah(monthlySales);

// ======================================
// TRANSAKSI TERBARU
// ======================================

const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

const recentTable = document.getElementById("recent-transactions");

if (recentTable) {

    if (recentTransactions.length === 0) {

        recentTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

    } else {

        recentTable.innerHTML = recentTransactions.map(transaction => `

            <tr>
                <td>${transaction.id || "-"}</td>

                <td>${formatTransactionDate(transaction.date)}</td>

                <td>${formatRupiah(Number(transaction.total || 0))}</td>

                <td>
                    <span class="status-badge status-success">
                        Selesai
                    </span>
                </td>
            </tr>

        `).join("");

    }

}

// ======================================
// PRODUK TERLARIS
// ======================================

const productSales = {};

transactions.forEach(transaction => {

    (transaction.items || []).forEach(item => {

        const name = item.name || "Menu tidak diketahui";

        if (!productSales[name]) {
            productSales[name] = 0;
        }

        productSales[name] += Number(item.qty || 0);

    });

});

const bestSellingProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

const bestSellingContainer = document.getElementById(
    "best-selling-products"
);

if (bestSellingContainer) {

    if (bestSellingProducts.length === 0) {

        bestSellingContainer.innerHTML = `
            <p style="text-align:center;">
                Belum ada data penjualan produk.
            </p>
        `;

    } else {

        bestSellingContainer.innerHTML = bestSellingProducts.map(
            (product, index) => `

                <div class="best-selling-item">

                    <div>
                        <strong>${index + 1}. ${product[0]}</strong>
                    </div>

                    <span>${product[1]} terjual</span>

                </div>

            `
        ).join("");

    }

}

// ======================================
// GRAFIK PENJUALAN 7 HARI TERAKHIR
// ======================================

const chartCanvas = document.getElementById(
    "dashboard-sales-chart"
);

if (chartCanvas && typeof Chart !== "undefined") {

    const labels = [];
    const salesData = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(date.getDate() - i);

        const localDate = getLocalDate(date);

        labels.push(
            date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short"
            })
        );

        const dailySales = transactions
            .filter(transaction => {
                return getLocalDate(transaction.date) === localDate;
            })
            .reduce((total, transaction) => {
                return total + Number(transaction.total || 0);
            }, 0);

        salesData.push(dailySales);

    }

    // Hapus grafik lama jika sudah ada
    if (window.dashboardSalesChart) {
        window.dashboardSalesChart.destroy();
    }

    // Buat grafik baru
    window.dashboardSalesChart = new Chart(chartCanvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Penjualan",

                data: salesData,

                borderColor: "#d6a75c",

                backgroundColor: "rgba(214, 167, 92, 0.12)",

                borderWidth: 3,

                fill: true,

                tension: 0.4,

                pointRadius: 4,

                pointBackgroundColor: "#d6a75c"
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function(value) {
                            return "Rp " + value.toLocaleString("id-ID");
                        }
                    }
                }

            }

        }

    });

}

}

// ======================================
// KOPIPOS - LOAD TRANSAKSI DARI SPREADSHEET
// ======================================

async function loadTransactionsFromAPI() {

    try {

        console.log("Mengambil riwayat transaksi...");

        const response = await fetch(
            `${API_URL}?action=getTransactions`
        );

        if (!response.ok) {
            throw new Error("Gagal menghubungi API transaksi.");
        }

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(
                result.message || "Gagal mengambil transaksi."
            );
        }

        // Simpan data terbaru ke localStorage
        localStorage.setItem(
            "kopipos_transactions",
            JSON.stringify(result.data)
        );

        // Status koneksi database
        const databaseStatus = document.getElementById("database-status");

        if (databaseStatus) {
             databaseStatus.textContent = "Terhubung";
             databaseStatus.style.color = "#6fd08c";
        }

        // Perbarui Dashboard
        if (typeof renderDashboard === "function") {
          renderDashboard();
        }

        // Perbarui tampilan riwayat
        if (typeof renderHistoryStatistics === "function") {
            renderHistoryStatistics();
        }

        if (typeof renderTransactionHistory === "function") {
            renderTransactionHistory();
        }

        // Perbarui tampilan laporan
        if (typeof renderSalesReport === "function") {
            renderSalesReport();
        }

        console.log(
            "Riwayat transaksi berhasil dimuat:",
            result.data
        );

    } catch (error) {

        const databaseStatus = document.getElementById("database-status");

        if (databaseStatus) {
            databaseStatus.textContent = "Tidak Terhubung";
            databaseStatus.style.color = "#e58b8b";
            }

        console.error(
            "Gagal memuat transaksi dari Spreadsheet:",
            error
        );

    }

}


// Muat transaksi saat website dibuka
loadTransactionsFromAPI();


// Perbarui data setiap 30 detik
setInterval(function() {
    loadTransactionsFromAPI();
}, 30000);

// ======================================
// KOPIPOS - PENGATURAN KEDAI
// ======================================

// Mengambil pengaturan dari Local Storage
function loadStoreSettings() {

    const settings = JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    );

    document.getElementById("store-name").value =
        settings.storeName || "";

    document.getElementById("store-address").value =
        settings.storeAddress || "";

    document.getElementById("store-phone").value =
        settings.storePhone || "";

    document.getElementById("cashier-name").value =
        settings.cashierName || "Admin";

    document.getElementById("receipt-message").value =
        settings.receiptMessage || "Terima kasih telah berkunjung!";
}


// Menyimpan pengaturan
document.getElementById("settings-form").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const settings = {

            storeName: document.getElementById("store-name").value,

            storeAddress: document.getElementById("store-address").value,

            storePhone: document.getElementById("store-phone").value,

            cashierName: document.getElementById("cashier-name").value,

            receiptMessage: document.getElementById("receipt-message").value

        };

        localStorage.setItem(
            "kopipos_settings",
            JSON.stringify(settings)
        );

        alert("Pengaturan kedai berhasil disimpan!");

    }
);


// Memuat pengaturan saat website dibuka
loadStoreSettings();

// ======================================
// KOPIPOS - UPLOAD LOGO KEDAI
// ======================================

function loadStoreLogo() {

    const savedLogo = localStorage.getItem("kopipos_logo");

    const preview = document.getElementById("logo-preview");

    if (savedLogo && preview) {

    preview.src = savedLogo;
    preview.style.display = "block";

    document.getElementById("remove-logo-button").style.display = "inline-block";

}

}


// Ketika pengguna memilih logo
document.getElementById("store-logo").addEventListener(
    "change",
    function(event) {

        const file = event.target.files[0];

        if (!file) return;

        // Validasi ukuran file maksimal 5 MB
        if (file.size > 5 * 1024 * 1024) {

            alert("Ukuran logo maksimal 5 MB!");

            event.target.value = "";

            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {

            const image = new Image();

            image.onload = function() {

                // Kompres dan ubah ukuran logo
                const canvas = document.createElement("canvas");

                const maxSize = 400;

                let width = image.width;
                let height = image.height;

                if (width > height && width > maxSize) {

                    height = Math.round(height * maxSize / width);
                    width = maxSize;

                } else if (height > maxSize) {

                    width = Math.round(width * maxSize / height);
                    height = maxSize;

                }

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                context.drawImage(image, 0, 0, width, height);

                const compressedLogo = canvas.toDataURL(
                    "image/jpeg",
                    0.8
                );

                try {

                    localStorage.setItem(
                        "kopipos_logo",
                        compressedLogo
                    );

                    const preview = document.getElementById("logo-preview");

                    preview.src = compressedLogo;
                    preview.style.display = "block";
                    document.getElementById("remove-logo-button").style.display = "inline-block";

                    alert("Logo kedai berhasil disimpan!");

                } catch (error) {

                    alert("Logo gagal disimpan. Ruang penyimpanan browser mungkin penuh.");

                }

            };

            image.src = e.target.result;

        };

        reader.readAsDataURL(file);

    }
);


// Tampilkan logo yang sudah tersimpan
loadStoreLogo();

// ======================================
// KOPIPOS - HAPUS LOGO KEDAI
// ======================================

const removeLogoButton = document.getElementById("remove-logo-button");

if (removeLogoButton) {

    removeLogoButton.addEventListener("click", function() {

        const confirmation = confirm(
            "Apakah Anda yakin ingin menghapus logo kedai?"
        );

        if (!confirmation) return;

        // Hapus logo dari Local Storage
        localStorage.removeItem("kopipos_logo");

        // Sembunyikan preview
        const preview = document.getElementById("logo-preview");

        preview.src = "";
        preview.style.display = "none";

        // Kosongkan input file
        document.getElementById("store-logo").value = "";

        // Sembunyikan tombol hapus
        removeLogoButton.style.display = "none";

        alert("Logo kedai berhasil dihapus!");

    });

}

// ======================================
// KOPIPOS - RESET PENGATURAN
// ======================================

const resetSettingsButton = document.getElementById(
    "reset-settings-button"
);

if (resetSettingsButton) {

    resetSettingsButton.addEventListener("click", function() {

        const confirmation = confirm(
            "Apakah Anda yakin ingin mengembalikan pengaturan kedai ke kondisi awal?"
        );

        if (!confirmation) return;

        // Hapus pengaturan kedai
        localStorage.removeItem("kopipos_settings");

        // Muat kembali nilai default
        loadStoreSettings();

        alert("Pengaturan kedai berhasil direset!");

    });

}

// ======================================
// KOPIPOS - EXPORT LAPORAN EXCEL
// ======================================

async function exportSalesReportExcel() {

    if (typeof ExcelJS === "undefined") {
        alert("Library ExcelJS belum berhasil dimuat.");
        return;
    }

    const transactions = getFilteredReportTransactions();

    if (transactions.length === 0) {
        alert("Tidak ada transaksi untuk diekspor.");
        return;
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "KopiPOS";
    workbook.subject = "Laporan Penjualan Kedai Kopi";
    workbook.title = "Laporan Penjualan KopiPOS";

    const worksheet = workbook.addWorksheet("Laporan Penjualan", {
        views: [
            { state: "frozen", ySplit: 8 }
        ]
    });

    // WARNA TEMA
    const black = "111111";
    const dark = "1C1C1C";
    const gold = "D6B16A";
    const white = "FFFFFF";
    const gray = "E5E5E5";

    // LEBAR KOLOM
    worksheet.columns = [
        { width: 8 },
        { width: 25 },
        { width: 23 },
        { width: 20 },
        { width: 14 },
        { width: 22 },
        { width: 20 },
        { width: 20 }
    ];

    // JUDUL LAPORAN
    worksheet.mergeCells("A1:H2");

    const title = worksheet.getCell("A1");

    title.value = "KOPIPOS | LAPORAN PENJUALAN";

    title.font = {
        name: "Arial",
        size: 18,
        bold: true,
        color: { argb: gold }
    };

    title.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: black }
    };

    title.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 18;

    // INFORMASI LAPORAN
    const settings = JSON.parse(
        localStorage.getItem("kopipos_settings") || "{}"
    );

    worksheet.mergeCells("A3:H3");

    worksheet.getCell("A3").value =
        settings.storeName || "Laporan Penjualan Kedai Kopi";

    worksheet.getCell("A3").font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: black }
    };

    worksheet.mergeCells("A4:H4");

    worksheet.getCell("A4").value =
        "Periode: " +
        document.getElementById("report-period")
            .selectedOptions[0].text;

    worksheet.getCell("A4").font = {
        name: "Arial",
        size: 10,
        color: { argb: "666666" }
    };

    worksheet.mergeCells("A5:H5");

    worksheet.getCell("A5").value =
        "Tanggal Export: " +
        new Date().toLocaleString("id-ID");

    worksheet.getCell("A5").font = {
        name: "Arial",
        size: 10,
        color: { argb: "666666" }
    };

    // RINGKASAN
    const totalSales = transactions.reduce(
        (total, item) => total + Number(item.total || 0),
        0
    );

    worksheet.mergeCells("A6:B6");
    worksheet.mergeCells("C6:D6");
    worksheet.mergeCells("E6:F6");
    worksheet.mergeCells("G6:H6");

    worksheet.getCell("A6").value =
        "TOTAL OMZET: Rp " +
        totalSales.toLocaleString("id-ID");

    worksheet.getCell("C6").value =
        "TRANSAKSI: " + transactions.length;

    worksheet.getCell("E6").value =
        "TOTAL ITEM: " +
        transactions.reduce((total, item) => {
            return total + (item.items || []).reduce(
                (sum, product) => sum + Number(product.qty || 0),
                0
            );
        }, 0);

    // MENENTUKAN NAMA KASIR BERDASARKAN TRANSAKSI
const cashierNames = [
    ...new Set(
        transactions.map(transaction =>
            String(transaction.cashier || "Admin").trim()
        )
    )
];

let cashierSummary = "Admin";

if (cashierNames.length === 1) {
    cashierSummary = cashierNames[0];
} else if (cashierNames.length > 1) {
    cashierSummary = "Semua Kasir";
}

worksheet.getCell("G6").value =
    "KASIR: " + cashierSummary;

    ["A6", "C6", "E6", "G6"].forEach(cell => {

        const target = worksheet.getCell(cell);

        target.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: gold }
        };

        target.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: dark }
        };

        target.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

    });

    worksheet.getRow(6).height = 28;

    // HEADER TABEL
    const headers = [
        "No",
        "ID Transaksi",
        "Tanggal",
        "Nama Kasir",
        "Total Item",
        "Total Pembayaran",
        "Uang Diterima",
        "Kembalian"
    ];

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(headers);

    headerRow.height = 30;

    headerRow.eachCell(cell => {

        cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: gold }
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: black }
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        cell.border = {
            bottom: {
                style: "medium",
                color: { argb: gold }
            }
        };

    });

    // DATA TRANSAKSI
    transactions.forEach((transaction, index) => {

        const totalItems = (transaction.items || []).reduce(
            (total, item) => total + Number(item.qty || 0),
            0
        );

        const row = worksheet.addRow([

            index + 1,
            transaction.id || "-",
            formatTransactionDate(transaction.date),
            transaction.cashier || "Admin",
            totalItems,
            Number(transaction.total || 0),
            Number(transaction.payment || 0),
            Number(transaction.change || 0)

        ]);

        row.height = 24;

        row.eachCell(cell => {

            cell.font = {
                name: "Arial",
                size: 10,
                color: { argb: black }
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };

            cell.border = {
                bottom: {
                    style: "thin",
                    color: { argb: gray }
                }
            };

        });

        if (index % 2 === 1) {

            row.eachCell(cell => {

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "F5F2EB" }
                };

            });

        }

        [6, 7, 8].forEach(column => {

            row.getCell(column).numFmt =
                '"Rp" #,##0';

            row.getCell(column).alignment = {
                horizontal: "right",
                vertical: "middle"
            };

        });

    });

    // PENGATURAN CETAK
    worksheet.pageSetup = {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
    };

    worksheet.pageSetup.margins = {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2
    };

    // DOWNLOAD FILE
    const period = document.getElementById("report-period").value;

    const periodNames = {
        hari: "Hari_Ini",
        minggu: "7_Hari_Terakhir",
        bulan: "Bulan_Ini",
        semua: "Semua_Transaksi"
    };

    const fileName =
        "KopiPOS_Laporan_" +
        (periodNames[period] || "Penjualan") +
        ".xlsx";

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob(
        [buffer],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("Laporan Excel profesional berhasil dibuat!");

}

// ======================================
// KOPIPOS - TOMBOL EXPORT EXCEL
// ======================================

const exportReportButton = document.getElementById(
    "export-report-excel"
);

if (exportReportButton) {

    exportReportButton.addEventListener("click", function() {

        exportSalesReportExcel();

    });

}