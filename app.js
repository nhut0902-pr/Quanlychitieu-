let currentSection = 'diary';
let map, markers = {}, polylines = {};
let watchId = null;

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

// Fix Leaflet default icon issue
if (typeof L !== 'undefined' && L.Icon) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

// Data Storage Initialization
let diaries = JSON.parse(localStorage.getItem('diaries')) || [];
let spendings = JSON.parse(localStorage.getItem('spendings')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 1000000;
let savedMarkers = JSON.parse(localStorage.getItem('markers')) || {};
let checklist = JSON.parse(localStorage.getItem('checklist')) || [];
let emergencyInfo = localStorage.getItem('emergencyInfo') || '';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    if (isDarkMode) document.body.classList.add('dark-mode');
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
    content.innerHTML = '';
    content.appendChild(template.content.cloneNode(true));

    // Update Nav UI
    document.querySelectorAll('.bottom-nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${section}`).classList.add('active');

    if (section === 'diary') initDiary();
    if (section === 'spending') initSpending();
    if (section === 'map') {
        initMap();
        setTimeout(() => map && map.invalidateSize(), 200);
    } else if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (section === 'checklist') initChecklist();
    if (section === 'extra') initExtra();
}

// --- Diary Logic ---
function initDiary() {
    renderDiaries();
    document.getElementById('diary-form').onsubmit = (e) => {
        e.preventDefault();
        const entry = {
            id: Date.now(),
            start: document.getElementById('start-point').value,
            end: document.getElementById('end-point').value,
            time: document.getElementById('departure-time').value,
            food: document.getElementById('food-place').value,
            cost: document.getElementById('trip-cost').value,
            rating: document.getElementById('diary-rating').value,
            coords: document.getElementById('diary-coords').value
        };
        diaries.push(entry);
        localStorage.setItem('diaries', JSON.stringify(diaries));
        renderDiaries();
        e.target.reset();
        document.getElementById('diary-coords').value = '';
    };
}

function getDiaryLocation() {
    if (!navigator.geolocation) return alert("Không hỗ trợ GPS");
    navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById('diary-coords').value = `${pos.coords.latitude},${pos.coords.longitude}`;
        alert("Đã lưu vị trí GPS hiện tại!");
    }, () => alert("Lỗi lấy vị trí"));
}

function renderDiaries() {
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

    list.innerHTML = filtered.slice().reverse().map(d => {
        const coordsDisplay = d.coords ? `
            <div style="font-size:11px; color:#666; margin-top:5px; background:#f9f9f9; padding:5px; border-radius:4px;">
                📍 Tọa độ: ${d.coords}
                <button onclick="copyCoords('${d.coords}')" style="margin-left:5px; font-size:10px; padding:2px 4px;">Copy</button>
                <a href="https://www.google.com/maps/search/?api=1&query=${d.coords}" target="_blank" style="margin-left:5px; font-size:10px; color:#2196F3;">G-Maps</a>
            </div>
        ` : '';

        return `
        <div class="diary-item">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong>${escapeHTML(d.start)} ➔ ${escapeHTML(d.end)}</strong> ${'⭐'.repeat(d.rating)}<br>
                    <small>🕒 ${new Date(d.time).toLocaleString('vi-VN')}</small>
                </div>
                <button onclick="deleteDiary(${d.id})" style="background:none; color:red; padding:5px; font-size:12px;">Xóa</button>
            </div>
            <div style="margin-top:8px; border-top:1px dashed #eee; padding-top:8px;">
                <em>🍴 ${escapeHTML(d.food) || 'Không ghi chú'}</em><br>
                ${coordsDisplay}
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                    <span style="color:#e91e63; font-weight:bold;">💰 ${Number(d.cost || 0).toLocaleString()}đ</span>
                    ${d.coords ? `<button onclick="showOnMap(${d.coords})" style="padding:2px 5px; font-size:10px;">📍 Xem bản đồ</button>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
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

function deleteDiary(id) {
    if (confirm('Xóa nhật ký này?')) {
        diaries = diaries.filter(d => d.id !== id);
        localStorage.setItem('diaries', JSON.stringify(diaries));
        renderDiaries();
    }
}

// --- Spending Logic ---
function initSpending() {
    const budgetInput = document.getElementById('budget-limit');
    budgetInput.value = budget;
    budgetInput.onchange = (e) => {
        budget = e.target.value;
        localStorage.setItem('budget', budget);
        updateBudgetUI();
    };

    renderSpendings();
    updateBudgetUI();

    document.getElementById('spending-form').onsubmit = (e) => {
        e.preventDefault();
        const item = {
            id: Date.now(),
            name: document.getElementById('spend-item').value,
            amount: Number(document.getElementById('spend-amount').value),
            category: document.getElementById('spend-category').value
        };
        spendings.push(item);
        localStorage.setItem('spendings', JSON.stringify(spendings));
        renderSpendings();
        updateBudgetUI();
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
        localStorage.setItem('spendings', JSON.stringify(spendings));
        renderSpendings();
        updateBudgetUI();
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
        progress.style.backgroundColor = percentage > 90 ? '#ff9800' : '#4CAF50';
        info.style.color = ''; // Reset to default (handles dark mode better)
        info.style.fontWeight = 'normal';
    }
}

// --- Checklist Logic ---
function initChecklist() {
    renderChecklist();
    document.getElementById('checklist-form').onsubmit = (e) => {
        e.preventDefault();
        const item = {
            id: Date.now(),
            text: document.getElementById('checklist-item').value,
            done: false
        };
        checklist.push(item);
        localStorage.setItem('checklist', JSON.stringify(checklist));
        renderChecklist();
        e.target.reset();
    };
}

function renderChecklist() {
    const list = document.getElementById('checklist-list');
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
        localStorage.setItem('checklist', JSON.stringify(checklist));
        renderChecklist();
    }
}

function deleteCheckItem(id) {
    checklist = checklist.filter(i => i.id !== id);
    localStorage.setItem('checklist', JSON.stringify(checklist));
    renderChecklist();
}

// --- Extra & Utils Logic ---
function initExtra() {
    document.getElementById('emergency-info').value = emergencyInfo;
    renderStats();
}

function saveEmergencyInfo() {
    emergencyInfo = document.getElementById('emergency-info').value;
    localStorage.setItem('emergencyInfo', emergencyInfo);
    alert("Đã lưu thông tin khẩn cấp!");
}

function renderStats() {
    const container = document.getElementById('stats-content');
    const cats = ['Ăn uống', 'Di chuyển', 'Lưu trú', 'Khác'];
    const total = spendings.reduce((sum, s) => sum + s.amount, 0);

    if (total === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">Chưa có dữ liệu chi tiêu.</p>';
        return;
    }

    container.innerHTML = cats.map(cat => {
        const catTotal = spendings.filter(s => s.category === cat).reduce((sum, s) => sum + s.amount, 0);
        const percent = total > 0 ? (catTotal / total) * 100 : 0;
        return `
            <div class="stat-bar-container">
                <div class="stat-bar-label">
                    <span>${escapeHTML(cat)}</span>
                    <span>${catTotal.toLocaleString()}đ (${percent.toFixed(1)}%)</span>
                </div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width:${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function exportData() {
    const data = { diaries, spendings, budget, savedMarkers, checklist, emergencyInfo };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_diary_backup_${new Date().toISOString().slice(0,10)}.json`;
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
                localStorage.setItem('diaries', JSON.stringify(data.diaries || []));
                localStorage.setItem('spendings', JSON.stringify(data.spendings || []));
                localStorage.setItem('budget', data.budget || 1000000);
                localStorage.setItem('markers', JSON.stringify(data.savedMarkers || {}));
                localStorage.setItem('checklist', JSON.stringify(data.checklist || []));
                localStorage.setItem('emergencyInfo', data.emergencyInfo || '');
                location.reload();
            }
        } catch (err) {
            alert("Lỗi nhập dữ liệu!");
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm("Xóa toàn bộ dữ liệu ứng dụng? Hành động này không thể hoàn tác.")) {
        localStorage.clear();
        location.reload();
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

    // Initial center (Saigon) or use first marker
    let initialCenter = [10.7769, 106.7009];
    if (savedMarkers.start) initialCenter = [savedMarkers.start.lat, savedMarkers.start.lng];

    map = L.map('map').setView(initialCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Render saved markers and lines
    Object.keys(savedMarkers).forEach(type => {
        const pos = savedMarkers[type];
        addMarkerToMap(pos.lat, pos.lng, type);
    });
    updateMapLines();

    // Render check-in points from diary
    diaries.forEach(d => {
        if (d.coords) {
            const [lat, lng] = d.coords.split(',').map(Number);
            L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: '#795548', // Brown
                color: '#fff',
                weight: 1,
                fillOpacity: 0.7
            }).addTo(map).bindPopup(`Check-in: ${escapeHTML(d.end)}<br>Tọa độ: ${d.coords}`);
        }
    });

    // Real-time tracking
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude, accuracy } = pos.coords;

            if (!markers.current) {
                markers.current = L.circleMarker([latitude, longitude], {
                    radius: 10,
                    fillColor: '#2196F3',
                    color: '#fff',
                    weight: 3,
                    fillOpacity: 1
                }).addTo(map).bindPopup(`Bạn đang ở đây<br>Độ chính xác: ${Math.round(accuracy)}m`);

                // If no other markers, center on user
                if (Object.keys(savedMarkers).length === 0) {
                    map.setView([latitude, longitude], 15);
                }
            } else {
                markers.current.setLatLng([latitude, longitude]);
                markers.current.setPopupContent(`Bạn đang ở đây<br>Độ chính xác: ${Math.round(accuracy)}m`);
            }
        }, err => console.error("Lỗi Real-time GPS:", err), {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });
    }
}

function recenterMap() {
    if (markers.current) {
        map.setView(markers.current.getLatLng(), 15);
    } else {
        alert("Đang tìm vị trí của bạn...");
    }
}

function markCurrentLocation(type) {
    if (!navigator.geolocation) return alert("Không hỗ trợ GPS");

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        savedMarkers[type] = { lat: latitude, lng: longitude };
        localStorage.setItem('markers', JSON.stringify(savedMarkers));

        addMarkerToMap(latitude, longitude, type);
        updateMapLines();
        map.setView([latitude, longitude], 15);

        // Show coordinate info
        const labels = { start: 'Điểm Đi', dest: 'Điểm Đến', return: 'Điểm Về' };
        alert(`Đã đánh dấu ${labels[type]}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }, (err) => alert("Lỗi định vị: " + err.message));
}

function addMarkerToMap(lat, lng, type) {
    if (markers[type]) map.removeLayer(markers[type]);

    const colors = { start: '#28a745', dest: '#007bff', return: '#dc3545' };
    const labels = { start: 'Điểm Đi', dest: 'Điểm Đến', return: 'Điểm Về' };

    markers[type] = L.marker([lat, lng]).addTo(map)
        .bindPopup(`${labels[type]}<br>Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}<br><a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">Xem trên G-Maps</a>`);
}

function updateMapLines() {
    // Clear existing polylines
    if (polylines.toDest) map.removeLayer(polylines.toDest);
    if (polylines.toReturn) map.removeLayer(polylines.toReturn);

    // Line from Start to Destination (Blue)
    if (savedMarkers.start && savedMarkers.dest) {
        polylines.toDest = L.polyline([
            [savedMarkers.start.lat, savedMarkers.start.lng],
            [savedMarkers.dest.lat, savedMarkers.dest.lng]
        ], { color: '#007bff', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }

    // Line from Destination to Return (Red)
    if (savedMarkers.dest && savedMarkers.return) {
        polylines.toReturn = L.polyline([
            [savedMarkers.dest.lat, savedMarkers.dest.lng],
            [savedMarkers.return.lat, savedMarkers.return.lng]
        ], { color: '#dc3545', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }
}
