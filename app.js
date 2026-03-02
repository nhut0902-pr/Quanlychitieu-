let currentSection = 'diary';
let map, markers = {}, polylines = {};
let watchId = null;
let selectedPhotos = [];

const translations = {
    vi: {
        nav_diary: "Nhật Ký",
        nav_spending: "Chi Tiêu",
        nav_map: "Bản Đồ",
        nav_trips: "Chuyến Đi",
        nav_settings: "Cài Đặt",
        settings_title: "Cài Đặt",
        appearance_lang: "Giao diện & Ngôn ngữ",
        select_language: "Ngôn ngữ:",
        theme_color: "Màu chủ đạo:",
        checklist_title: "Danh Sách Chuẩn Bị",
        data_report: "Dữ Liệu & Báo Cáo",
        export_report: "Xuất Báo Cáo Tổng Kết (PDF)",
        export_json: "Xuất Dữ Liệu (JSON)",
        import_json: "Nhập Dữ Liệu",
        clear_all: "Xóa Tất Cả Dữ Liệu",
        emergency_title: "Thông Tin Khẩn Cấp",
        save_btn: "Lưu Thông Tin",
        add_trip: "Tạo Chuyến Đi Mới",
        trip_placeholder: "Tên chuyến đi mới (vd: Đà Lạt 2024)",
        start_placeholder: "Điểm xuất phát",
        end_placeholder: "Điểm đến",
        food_placeholder: "Ăn gì ở đâu?",
        cost_placeholder: "Giá cả (ước tính)",
        add_diary: "Thêm Nhật Ký",
        search_placeholder: "Tìm kiếm nhật ký...",
        budget_label: "Ngân sách:",
        item_placeholder: "Tên món ăn/đồ dùng",
        price_placeholder: "Giá tiền",
        add_spending: "Ghi Chi Tiêu",
        checklist_placeholder: "Thêm đồ dùng...",
        add_btn: "Thêm",
        cat_food: "🍴 Ăn uống",
        cat_transport: "🚗 Di chuyển",
        cat_hotel: "🏨 Lưu trú",
        cat_other: "🏷️ Khác",
        spending_analytics: "Phân Tích Chi Tiêu",
        map_title: "Bản Đồ Hành Trình",
        mark_start: "Điểm Đi",
        mark_dest: "Điểm Đến",
        mark_return: "Điểm Về",
        recenter_btn: "Tâm Vị Trí Hiện Tại",
        current_speed: "Tốc độ hiện tại",
        no_diary: "Không tìm thấy nhật ký.",
        delete_confirm: "Bạn có chắc muốn xóa?",
        copy_success: "Đã copy tọa độ: "
    },
    en: {
        nav_diary: "Diary",
        nav_spending: "Spending",
        nav_map: "Map",
        nav_trips: "Trips",
        nav_settings: "Settings",
        settings_title: "Settings",
        appearance_lang: "Appearance & Language",
        select_language: "Language:",
        theme_color: "Primary Color:",
        checklist_title: "Checklist",
        data_report: "Data & Reports",
        export_report: "Export Summary Report (PDF)",
        export_json: "Export Data (JSON)",
        import_json: "Import Data",
        clear_all: "Clear All Data",
        emergency_title: "Emergency Info",
        save_btn: "Save Info",
        add_trip: "Create New Trip",
        trip_placeholder: "New trip name (e.g. Paris 2024)",
        start_placeholder: "Start point",
        end_placeholder: "Destination",
        food_placeholder: "What to eat/where?",
        cost_placeholder: "Cost (est.)",
        add_diary: "Add Diary",
        search_placeholder: "Search diaries...",
        budget_label: "Budget:",
        item_placeholder: "Item name",
        price_placeholder: "Price",
        add_spending: "Record Spending",
        checklist_placeholder: "Add item...",
        add_btn: "Add",
        cat_food: "🍴 Food",
        cat_transport: "🚗 Transport",
        cat_hotel: "🏨 Hotel",
        cat_other: "🏷️ Other",
        spending_analytics: "Spending Analytics",
        map_title: "Journey Map",
        mark_start: "Start Point",
        mark_dest: "Destination",
        mark_return: "Return Point",
        recenter_btn: "Center on Me",
        current_speed: "Current Speed",
        no_diary: "No diaries found.",
        delete_confirm: "Are you sure you want to delete?",
        copy_success: "Coordinates copied: "
    }
};

let currentLang = localStorage.getItem('lang') || 'vi';
let primaryColor = localStorage.getItem('primaryColor') || '#3f51b5';

// IndexedDB Setup for Photos
const DB_NAME = 'TravelDiaryDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function savePhoto(photoData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(photoData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getPhotos(entryId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(entryId);
        request.onsuccess = () => resolve(request.result ? request.result.data : []);
        request.onerror = () => reject(request.error);
    });
}

async function deletePhotos(entryId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(entryId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

// Multi-trip logic
let trips = JSON.parse(localStorage.getItem('trips')) || [];
let currentTripId = localStorage.getItem('currentTripId') || null;

function saveTrips() {
    localStorage.setItem('trips', JSON.stringify(trips));
}

function getCurrentTrip() {
    return trips.find(t => t.id == currentTripId) || null;
}

// Data Variables (Load based on current trip)
let diaries = [];
let spendings = [];
let budget = 1000000;
let savedMarkers = {};
let checklist = [];
let emergencyInfo = '';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--primary-color', color);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', color);
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    // Update placeholders
    const placeholders = {
        'trip-name': 'trip_placeholder',
        'start-point': 'start_placeholder',
        'end-point': 'end_placeholder',
        'food-place': 'food_placeholder',
        'trip-cost': 'cost_placeholder',
        'diary-search': 'search_placeholder',
        'spend-item': 'item_placeholder',
        'spend-amount': 'price_placeholder',
        'checklist-item': 'checklist_placeholder'
    };

    for (let id in placeholders) {
        const el = document.getElementById(id);
        if (el) el.placeholder = translations[currentLang][placeholders[id]];
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateLanguage();
}

function changeThemeColor(color) {
    primaryColor = color;
    localStorage.setItem('primaryColor', color);
    applyThemeColor(color);
}

function loadTripData() {
    const trip = getCurrentTrip();
    if (trip) {
        diaries = trip.diaries || [];
        spendings = trip.spendings || [];
        budget = trip.budget || 1000000;
        savedMarkers = trip.markers || {};
        checklist = trip.checklist || [];
        emergencyInfo = trip.emergencyInfo || '';
    } else {
        diaries = []; spendings = []; budget = 1000000; savedMarkers = {}; checklist = []; emergencyInfo = '';
    }
}

function syncTripData() {
    if (!currentTripId) return;
    const index = trips.findIndex(t => t.id == currentTripId);
    if (index !== -1) {
        trips[index].diaries = diaries;
        trips[index].spendings = spendings;
        trips[index].budget = budget;
        trips[index].markers = savedMarkers;
        trips[index].checklist = checklist;
        trips[index].emergencyInfo = emergencyInfo;
        saveTrips();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    applyThemeColor(primaryColor);
    updateLanguage();

    // Auto-create first trip if none exists
    if (trips.length === 0) {
        const firstTrip = {
            id: Date.now(),
            name: 'Chuyến đi mặc định',
            diaries: JSON.parse(localStorage.getItem('diaries')) || [],
            spendings: JSON.parse(localStorage.getItem('spendings')) || [],
            budget: parseFloat(localStorage.getItem('budget')) || 1000000,
            markers: JSON.parse(localStorage.getItem('markers')) || {},
            checklist: JSON.parse(localStorage.getItem('checklist')) || [],
            emergencyInfo: localStorage.getItem('emergencyInfo') || ''
        };
        trips.push(firstTrip);
        currentTripId = firstTrip.id;
        localStorage.setItem('currentTripId', currentTripId);
        saveTrips();
    } else if (!currentTripId) {
        currentTripId = trips[0].id;
        localStorage.setItem('currentTripId', currentTripId);
    }

    loadTripData();
    showSection('diary');
});

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    document.getElementById('theme-toggle').innerText = isDarkMode ? '☀️' : '🌙';
}

function showSection(section) {
    currentSection = section;
    const content = document.getElementById('content');
    const template = document.getElementById(`${section}-template`);
    if (!template) return;
    content.innerHTML = '';
    content.appendChild(template.content.cloneNode(true));

    // Update Nav UI
    document.querySelectorAll('.bottom-nav button').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById(`nav-${section}`);
    if (navBtn) navBtn.classList.add('active');

    // Update Trip Titles
    const trip = getCurrentTrip();
    const titleElements = ['diary', 'spending', 'settings', 'map'];
    titleElements.forEach(elId => {
        const el = document.getElementById(`current-trip-title-${elId}`);
        if (el && trip) el.innerText = trip.name;
    });

    if (section === 'diary') initDiary();
    if (section === 'spending') initSpending();
    if (section === 'trips') initTrips();
    if (section === 'settings') initSettings();

    updateLanguage();

    if (section === 'map') {
        initMap();
        setTimeout(() => map && map.invalidateSize(), 200);
    } else if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (section === 'settings') initSettings();
}

// --- Trips Logic ---
function initTrips() {
    renderTrips();
    document.getElementById('trip-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('trip-name').value;
        const newTrip = {
            id: Date.now(),
            name: name,
            diaries: [],
            spendings: [],
            budget: 1000000,
            markers: {},
            checklist: [],
            emergencyInfo: ''
        };
        trips.push(newTrip);
        saveTrips();
        renderTrips();
        e.target.reset();
    };
}

function renderTrips() {
    const list = document.getElementById('trip-list');
    const diaryText = currentLang === 'vi' ? 'mục nhật ký' : 'diaries';
    const spendText = currentLang === 'vi' ? 'khoản chi' : 'expenses';
    const deleteText = currentLang === 'vi' ? 'Xóa' : 'Delete';

    list.innerHTML = trips.map(t => `
        <div class="diary-item ${t.id == currentTripId ? 'active-trip' : ''}" style="cursor:pointer; border-left: 5px solid ${t.id == currentTripId ? 'var(--primary-color)' : '#ccc'}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div onclick="switchTrip(${t.id})" style="flex:1;">
                    <strong>${escapeHTML(t.name)}</strong><br>
                    <small>${t.diaries.length} ${diaryText} | ${t.spendings.length} ${spendText}</small>
                </div>
                <div>
                    <button onclick="deleteTrip(${t.id})" style="background:none; color:red; padding:5px;">${deleteText}</button>
                </div>
            </div>
        </div>
    `).join('');
}

function switchTrip(id) {
    currentTripId = id;
    localStorage.setItem('currentTripId', currentTripId);
    loadTripData();
    showSection('diary');
}

function deleteTrip(id) {
    if (trips.length <= 1) return alert(currentLang === 'vi' ? "Không thể xóa chuyến đi cuối cùng." : "Cannot delete the last trip.");
    if (confirm(translations[currentLang].delete_confirm)) {
        trips = trips.filter(t => t.id != id);
        if (currentTripId == id) {
            currentTripId = trips[0].id;
            localStorage.setItem('currentTripId', currentTripId);
        }
        saveTrips();
        loadTripData();
        renderTrips();
    }
}

// --- Diary Logic ---
function initDiary() {
    selectedPhotos = [];
    renderDiaries();
    document.getElementById('diary-form').onsubmit = async (e) => {
        e.preventDefault();
        const entryId = Date.now();
        const entry = {
            id: entryId,
            start: document.getElementById('start-point').value,
            end: document.getElementById('end-point').value,
            time: document.getElementById('departure-time').value,
            food: document.getElementById('food-place').value,
            cost: document.getElementById('trip-cost').value,
            rating: document.getElementById('diary-rating').value,
            coords: document.getElementById('diary-coords').value,
            hasPhotos: selectedPhotos.length > 0
        };

        if (selectedPhotos.length > 0) {
            await savePhoto({ id: entryId, data: selectedPhotos });
        }

        diaries.push(entry);
        syncTripData();
        renderDiaries();
        e.target.reset();
        document.getElementById('diary-coords').value = '';
        document.getElementById('photo-preview').innerHTML = '';
        selectedPhotos = [];
    };
}

function handlePhotoSelect(e) {
    const files = Array.from(e.target.files).slice(0, 2);
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = '';
    selectedPhotos = [];

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            selectedPhotos.push(base64);
            const img = document.createElement('img');
            img.src = base64;
            img.style.height = '60px';
            img.style.borderRadius = '4px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function getDiaryLocation() {
    if (!navigator.geolocation) return alert("Không hỗ trợ GPS");
    navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById('diary-coords').value = `${pos.coords.latitude},${pos.coords.longitude}`;
        alert("Đã lưu vị trí GPS hiện tại!");
    }, () => alert("Lỗi lấy vị trí"));
}

async function renderDiaries() {
    const list = document.getElementById('diary-list');
    const searchTerm = document.getElementById('diary-search')?.value.toLowerCase() || '';

    const filtered = diaries.filter(d =>
        d.start.toLowerCase().includes(searchTerm) ||
        d.end.toLowerCase().includes(searchTerm) ||
        (d.food && d.food.toLowerCase().includes(searchTerm))
    );

    if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:#888;">${translations[currentLang].no_diary}</p>`;
        return;
    }

    const deleteText = currentLang === 'vi' ? 'Xóa' : 'Delete';
    const coordText = currentLang === 'vi' ? 'Tọa độ' : 'Coords';
    const viewMapText = currentLang === 'vi' ? 'Xem bản đồ' : 'View map';

    list.innerHTML = '';
    for (const d of filtered.slice().reverse()) {
        const item = document.createElement('div');
        item.className = 'diary-item';

        let photosHtml = '';
        if (d.hasPhotos) {
            const photos = await getPhotos(d.id);
            photosHtml = `<div style="display:flex; gap:5px; margin-top:8px; overflow-x:auto;">
                ${photos.map(p => `<img src="${p}" style="height:80px; border-radius:4px;" onclick="viewFullImage('${p}')">`).join('')}
            </div>`;
        }

        const coordsDisplay = d.coords ? `
            <div style="font-size:11px; color:#666; margin-top:5px; background:#f9f9f9; padding:5px; border-radius:4px;">
                📍 Tọa độ: ${d.coords}
                <button onclick="copyCoords('${d.coords}')" style="margin-left:5px; font-size:10px; padding:2px 4px;">Copy</button>
                <a href="https://www.google.com/maps/search/?api=1&query=${d.coords}" target="_blank" style="margin-left:5px; font-size:10px; color:#2196F3;">G-Maps</a>
            </div>
        ` : '';

        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong>${escapeHTML(d.start)} ➔ ${escapeHTML(d.end)}</strong> ${'⭐'.repeat(d.rating)}<br>
                    <small>🕒 ${new Date(d.time).toLocaleString(currentLang === 'vi' ? 'vi-VN' : 'en-US')}</small>
                </div>
                <button onclick="deleteDiary(${d.id})" style="background:none; color:red; padding:5px; font-size:12px;">${deleteText}</button>
            </div>
            <div style="margin-top:8px; border-top:1px dashed #eee; padding-top:8px;">
                <em>🍴 ${escapeHTML(d.food) || (currentLang === 'vi' ? 'Không ghi chú' : 'No notes')}</em><br>
                ${photosHtml}
                ${coordsDisplay}
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                    <span style="color:#e91e63; font-weight:bold;">💰 ${Number(d.cost || 0).toLocaleString()}đ</span>
                    ${d.coords ? `<button onclick="showOnMap(${d.coords})" style="padding:2px 5px; font-size:10px;">📍 ${viewMapText}</button>` : ''}
                </div>
            </div>
        `;
        list.appendChild(item);
    }
}

function viewFullImage(src) {
    const viewer = document.createElement('div');
    viewer.style.position = 'fixed';
    viewer.style.top = 0; viewer.style.left = 0; viewer.style.width = '100%'; viewer.style.height = '100%';
    viewer.style.backgroundColor = 'rgba(0,0,0,0.9)';
    viewer.style.zIndex = 10000;
    viewer.style.display = 'flex'; viewer.style.alignItems = 'center'; viewer.style.justifyContent = 'center';
    viewer.onclick = () => viewer.remove();

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '95%'; img.style.maxHeight = '95%';
    viewer.appendChild(img);
    document.body.appendChild(viewer);
}

function copyCoords(coords) {
    navigator.clipboard.writeText(coords).then(() => {
        alert(translations[currentLang].copy_success + coords);
    });
}

function showOnMap(lat, lng) {
    showSection('map');
    setTimeout(() => {
        if (!map) return;
        map.setView([lat, lng], 15);
        L.marker([lat, lng]).addTo(map)
            .bindPopup(`Điểm Check-in<br>Tọa độ: ${lat}, ${lng}<br><a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">Google Maps</a>`)
            .openPopup();
    }, 500);
}

async function deleteDiary(id) {
    if (confirm(translations[currentLang].delete_confirm)) {
        diaries = diaries.filter(d => d.id !== id);
        await deletePhotos(id);
        syncTripData();
        renderDiaries();
    }
}

// --- Spending Logic ---
function initSpending() {
    const catSelect = document.getElementById('spend-category');
    if (catSelect) {
        catSelect.innerHTML = `
            <option value="Ăn uống">${translations[currentLang].cat_food}</option>
            <option value="Di chuyển">${translations[currentLang].cat_transport}</option>
            <option value="Lưu trú">${translations[currentLang].cat_hotel}</option>
            <option value="Khác">${translations[currentLang].cat_other}</option>
        `;
    }

    const budgetInput = document.getElementById('budget-limit');
    budgetInput.value = budget;
    budgetInput.onchange = (e) => {
        budget = Number(e.target.value);
        syncTripData();
        updateBudgetUI();
        drawSpendingChart();
    };

    renderSpendings();
    updateBudgetUI();
    drawSpendingChart();

    document.getElementById('spending-form').onsubmit = (e) => {
        e.preventDefault();
        const item = {
            id: Date.now(),
            name: document.getElementById('spend-item').value,
            amount: Number(document.getElementById('spend-amount').value),
            category: document.getElementById('spend-category').value
        };
        spendings.push(item);
        syncTripData();
        renderSpendings();
        updateBudgetUI();
        drawSpendingChart();
        e.target.reset();
    };
}

function renderSpendings() {
    const list = document.getElementById('spending-list');
    if (spendings.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888;">Chưa có chi tiêu nào.</p>';
        return;
    }
    list.innerHTML = spendings.slice().reverse().map(s => `
        <li>
            <span>${escapeHTML(s.name)} <small style="color:#888;">(${escapeHTML(s.category)})</small></span>
            <div>
                <span style="font-weight:bold;">${s.amount.toLocaleString()}đ</span>
                <button onclick="deleteSpending(${s.id})" style="background:none; color:red; padding:0 0 0 10px; font-size:12px; border:none;">✕</button>
            </div>
        </li>
    `).join('');
}

function deleteSpending(id) {
    if (confirm(translations[currentLang].delete_confirm)) {
        spendings = spendings.filter(s => s.id !== id);
        syncTripData();
        renderSpendings();
        updateBudgetUI();
        drawSpendingChart();
    }
}

function updateBudgetUI() {
    const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);
    const info = document.getElementById('budget-info');
    const progress = document.getElementById('budget-progress');

    info.innerText = `${totalSpent.toLocaleString()} / ${Number(budget).toLocaleString()} đ`;
    const percentage = Math.min((totalSpent / budget) * 100, 100);
    progress.style.width = percentage + '%';

    if (totalSpent > budget) {
        progress.style.backgroundColor = '#f44336';
        info.style.color = '#f44336';
        info.style.fontWeight = 'bold';
    } else {
        progress.style.backgroundColor = percentage > 90 ? '#ff9800' : '#3f51b5';
        info.style.color = '';
        info.style.fontWeight = 'normal';
    }
}

function drawSpendingChart() {
    const canvas = document.getElementById('spending-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const legend = document.getElementById('chart-legend');

    const cats = ['Ăn uống', 'Di chuyển', 'Lưu trú', 'Khác'];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
    const data = cats.map(cat => spendings.filter(s => s.category === cat).reduce((sum, s) => sum + s.amount, 0));
    const total = data.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    legend.innerHTML = '';

    if (total === 0) {
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(100, 100, 80, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    let startAngle = 0;
    data.forEach((val, i) => {
        if (val === 0) return;
        const sliceAngle = (val / total) * 2 * Math.PI;

        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        startAngle += sliceAngle;

        const p = (val / total * 100).toFixed(1);
        legend.innerHTML += `<div><span style="display:inline-block; width:12px; height:12px; background:${colors[i]}; margin-right:5px;"></span>${cats[i]}: ${p}%</div>`;
    });
}

// --- Settings & Utils Logic ---
function initSettings() {
    document.getElementById('emergency-info').value = emergencyInfo;
    document.getElementById('lang-select').value = currentLang;
    document.getElementById('theme-color-picker').value = primaryColor;
    renderChecklist();
    document.getElementById('checklist-form').onsubmit = (e) => {
        e.preventDefault();
        const item = {
            id: Date.now(),
            text: document.getElementById('checklist-item').value,
            done: false
        };
        checklist.push(item);
        syncTripData();
        renderChecklist();
        e.target.reset();
    };
}

function renderChecklist() {
    const list = document.getElementById('checklist-list');
    if (!list) return;
    list.innerHTML = checklist.map(item => `
        <li class="checklist-item ${item.done ? 'done' : ''}">
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleCheckItem(${item.id})">
            <span style="flex:1;">${escapeHTML(item.text)}</span>
            <button onclick="deleteCheckItem(${item.id})" style="background:none; color:red; padding:5px;">✕</button>
        </li>
    `).join('');
}

function toggleCheckItem(id) {
    const item = checklist.find(i => i.id === id);
    if (item) {
        item.done = !item.done;
        syncTripData();
        renderChecklist();
    }
}

function deleteCheckItem(id) {
    checklist = checklist.filter(i => i.id !== id);
    syncTripData();
    renderChecklist();
}

function saveEmergencyInfo() {
    emergencyInfo = document.getElementById('emergency-info').value;
    syncTripData();
    alert("Đã lưu thông tin khẩn cấp!");
}

async function generateTripReport() {
    const trip = getCurrentTrip();
    if (!trip) return;

    const reportWindow = window.open('', '_blank');
    const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);

    let diariesHtml = '';
    for(const d of diaries) {
        let photosHtml = '';
        if (d.hasPhotos) {
            const photos = await getPhotos(d.id);
            photosHtml = `<div style="display:flex; gap:10px; margin-top:10px;">
                ${photos.map(p => `<img src="${p}" style="max-height:150px; border-radius:5px;">`).join('')}
            </div>`;
        }
        diariesHtml += `
            <div style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <strong>${escapeHTML(d.start)} ➔ ${escapeHTML(d.end)}</strong> (${new Date(d.time).toLocaleString(currentLang === 'vi' ? 'vi-VN' : 'en-US')})<br>
                🍴 ${escapeHTML(d.food) || 'N/A'} | 💰 ${Number(d.cost).toLocaleString()}đ | ${'⭐'.repeat(d.rating)}<br>
                ${photosHtml}
            </div>
        `;
    }

    reportWindow.document.write(`
        <html>
        <head><title>Report: ${escapeHTML(trip.name)}</title>
        <style>body{font-family:sans-serif; padding:20px; line-height:1.6;} .header{text-align:center; border-bottom:2px solid ${primaryColor}; padding-bottom:10px;}</style>
        </head>
        <body>
            <div class="header"><h1>${currentLang === 'vi' ? 'TỔNG KẾT CHUYẾN ĐI' : 'TRIP SUMMARY'}: ${escapeHTML(trip.name)}</h1></div>
            <p><strong>${currentLang === 'vi' ? 'Tổng chi tiêu' : 'Total spent'}:</strong> ${totalSpent.toLocaleString()}đ / ${currentLang === 'vi' ? 'Ngân sách' : 'Budget'}: ${Number(budget).toLocaleString()}đ</p>
            <h3>${currentLang === 'vi' ? 'Chi tiết Nhật ký' : 'Diary Details'}:</h3>
            ${diariesHtml}
            <div style="margin-top: 50px; text-align: center; font-size: 12px; opacity: 0.5; border-top: 1px solid #eee; padding-top: 10px;">
                Powered By Nhutcoder
            </div>
            <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
        </body>
        </html>
    `);
}

function exportData() {
    const data = { trips, currentTripId, version: '2.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_all_trips_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Nhập dữ liệu sẽ ghi đè dữ liệu hiện tại. Tiếp tục?")) {
                if (data.trips) {
                    trips = data.trips;
                    currentTripId = data.currentTripId || trips[0].id;
                    saveTrips();
                    localStorage.setItem('currentTripId', currentTripId);
                } else {
                    // Legacy support
                    const legacyTrip = {
                        id: Date.now(),
                        name: 'Chuyến đi Nhập về',
                        diaries: data.diaries || [],
                        spendings: data.spendings || [],
                        budget: data.budget || 1000000,
                        markers: data.savedMarkers || {},
                        checklist: data.checklist || [],
                        emergencyInfo: data.emergencyInfo || ''
                    };
                    trips.push(legacyTrip);
                    currentTripId = legacyTrip.id;
                    saveTrips();
                    localStorage.setItem('currentTripId', currentTripId);
                }
                location.reload();
            }
        } catch (err) {
            alert("Lỗi nhập dữ liệu!");
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm("Xóa TOÀN BỘ dữ liệu tất cả chuyến đi?")) {
        localStorage.clear();
        // Also clear IndexedDB
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => location.reload();
    }
}

// --- Map Logic ---
function initMap() {
    if (map) {
        map.remove();
        map = null;
    }
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    markers = {};
    polylines = {};

    let initialCenter = [10.7769, 106.7009];
    if (savedMarkers.start) initialCenter = [savedMarkers.start.lat, savedMarkers.start.lng];

    map = L.map('map').setView(initialCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    Object.keys(savedMarkers).forEach(type => {
        const pos = savedMarkers[type];
        addMarkerToMap(pos.lat, pos.lng, type);
    });
    updateMapLines();

    diaries.forEach(d => {
        if (d.coords) {
            const [lat, lng] = d.coords.split(',').map(Number);
            L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: '#795548',
                color: '#fff',
                weight: 1,
                fillOpacity: 0.7
            }).addTo(map).bindPopup(`Check-in: ${escapeHTML(d.end)}<br>Tọa độ: ${d.coords}`);
        }
    });

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude, speed } = pos.coords;

            // Update Speedometer
            const speedEl = document.getElementById('speed-value');
            if (speedEl) {
                // speed is in m/s, convert to km/h. If null, show 0.
                const kmh = speed ? Math.round(speed * 3.6) : 0;
                speedEl.innerText = kmh;
            }

            if (!markers.current) {
                markers.current = L.circleMarker([latitude, longitude], {
                    radius: 10, fillColor: '#2196F3', color: '#fff', weight: 3, fillOpacity: 1
                }).addTo(map).bindPopup(`Bạn đang ở đây`);
                if (Object.keys(savedMarkers).length === 0) map.setView([latitude, longitude], 15);
            } else {
                markers.current.setLatLng([latitude, longitude]);
            }
        }, null, { enableHighAccuracy: true });
    }
}

function recenterMap() {
    if (markers.current) map.setView(markers.current.getLatLng(), 15);
}

function markCurrentLocation(type) {
    if (!navigator.geolocation) return alert("Không hỗ trợ GPS");
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        savedMarkers[type] = { lat: latitude, lng: longitude };
        syncTripData();
        addMarkerToMap(latitude, longitude, type);
        updateMapLines();
        map.setView([latitude, longitude], 15);
    });
}

function addMarkerToMap(lat, lng, type) {
    if (markers[type]) map.removeLayer(markers[type]);
    const labels = { start: 'Điểm Đi', dest: 'Điểm Đến', return: 'Điểm Về' };
    markers[type] = L.marker([lat, lng]).addTo(map)
        .bindPopup(`${labels[type]}<br>Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
}

function updateMapLines() {
    if (polylines.toDest) map.removeLayer(polylines.toDest);
    if (polylines.toReturn) map.removeLayer(polylines.toReturn);
    if (savedMarkers.start && savedMarkers.dest) {
        polylines.toDest = L.polyline([
            [savedMarkers.start.lat, savedMarkers.start.lng],
            [savedMarkers.dest.lat, savedMarkers.dest.lng]
        ], { color: '#007bff', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }
    if (savedMarkers.dest && savedMarkers.return) {
        polylines.toReturn = L.polyline([
            [savedMarkers.dest.lat, savedMarkers.dest.lng],
            [savedMarkers.return.lat, savedMarkers.return.lng]
        ], { color: '#dc3545', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }
}
