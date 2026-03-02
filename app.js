let currentSection = 'diary';
let map, markers = {}, polylines = {};
let watchId = null;
let selectedPhotos = [];

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
    const titleElements = ['diary', 'spending', 'extra', 'map'];
    titleElements.forEach(elId => {
        const el = document.getElementById(`current-trip-title-${elId}`);
        if (el && trip) el.innerText = trip.name;
    });

    if (section === 'diary') initDiary();
    if (section === 'spending') initSpending();
    if (section === 'trips') initTrips();
    if (section === 'map') {
        initMap();
        setTimeout(() => map && map.invalidateSize(), 200);
    } else if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (section === 'extra') initExtra();
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
    list.innerHTML = trips.map(t => `
        <div class="diary-item ${t.id == currentTripId ? 'active-trip' : ''}" style="cursor:pointer; border-left: 5px solid ${t.id == currentTripId ? '#3f51b5' : '#ccc'}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div onclick="switchTrip(${t.id})" style="flex:1;">
                    <strong>${escapeHTML(t.name)}</strong><br>
                    <small>${t.diaries.length} mục nhật ký | ${t.spendings.length} khoản chi</small>
                </div>
                <div>
                    <button onclick="deleteTrip(${t.id})" style="background:none; color:red; padding:5px;">Xóa</button>
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
    if (trips.length <= 1) return alert("Không thể xóa chuyến đi cuối cùng.");
    if (confirm('Xóa toàn bộ dữ liệu của chuyến đi này?')) {
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
        list.innerHTML = '<p style="text-align:center; color:#888;">Không tìm thấy nhật ký.</p>';
        return;
    }

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
                    <small>🕒 ${new Date(d.time).toLocaleString('vi-VN')}</small>
                </div>
                <button onclick="deleteDiary(${d.id})" style="background:none; color:red; padding:5px; font-size:12px;">Xóa</button>
            </div>
            <div style="margin-top:8px; border-top:1px dashed #eee; padding-top:8px;">
                <em>🍴 ${escapeHTML(d.food) || 'Không ghi chú'}</em><br>
                ${photosHtml}
                ${coordsDisplay}
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                    <span style="color:#e91e63; font-weight:bold;">💰 ${Number(d.cost || 0).toLocaleString()}đ</span>
                    ${d.coords ? `<button onclick="showOnMap(${d.coords})" style="padding:2px 5px; font-size:10px;">📍 Xem bản đồ</button>` : ''}
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
        alert("Đã copy tọa độ: " + coords);
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
    if (confirm('Xóa nhật ký này?')) {
        diaries = diaries.filter(d => d.id !== id);
        await deletePhotos(id);
        syncTripData();
        renderDiaries();
    }
}

// --- Spending Logic ---
function initSpending() {
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
    if (confirm('Xóa khoản chi này?')) {
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

// --- Extra & Utils Logic ---
function initExtra() {
    document.getElementById('emergency-info').value = emergencyInfo;
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
                <strong>${d.start} ➔ ${d.end}</strong> (${new Date(d.time).toLocaleString()})<br>
                🍴 ${d.food || 'N/A'} | 💰 ${Number(d.cost).toLocaleString()}đ | ${'⭐'.repeat(d.rating)}<br>
                ${photosHtml}
            </div>
        `;
    }

    reportWindow.document.write(`
        <html>
        <head><title>Báo Cáo: ${trip.name}</title>
        <style>body{font-family:sans-serif; padding:20px; line-height:1.6;} .header{text-align:center; border-bottom:2px solid #3f51b5; padding-bottom:10px;}</style>
        </head>
        <body>
            <div class="header"><h1>TỔNG KẾT CHUYẾN ĐI: ${trip.name}</h1></div>
            <p><strong>Tổng chi tiêu:</strong> ${totalSpent.toLocaleString()}đ / Ngân sách: ${Number(budget).toLocaleString()}đ</p>
            <h3>Chi tiết Nhật ký:</h3>
            ${diariesHtml}
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
            const { latitude, longitude, accuracy } = pos.coords;
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
