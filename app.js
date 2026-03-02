let currentSection = 'diary';
let map, markers = {};

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
    if (section === 'map') initMap();
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

    list.innerHTML = filtered.slice().reverse().map(d => `
        <div class="diary-item">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong>${d.start} ➔ ${d.end}</strong> ${'⭐'.repeat(d.rating)}<br>
                    <small>🕒 ${new Date(d.time).toLocaleString('vi-VN')}</small>
                </div>
                <button onclick="deleteDiary(${d.id})" style="background:none; color:red; padding:5px; font-size:12px;">Xóa</button>
            </div>
            <div style="margin-top:8px; border-top:1px dashed #eee; padding-top:8px;">
                <em>🍴 ${d.food || 'Không ghi chú'}</em><br>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:#e91e63; font-weight:bold;">💰 ${Number(d.cost || 0).toLocaleString()}đ</span>
                    ${d.coords ? `<button onclick="showOnMap(${d.coords})" style="padding:2px 5px; font-size:10px;">📍 Xem bản đồ</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function showOnMap(lat, lng) {
    showSection('map');
    setTimeout(() => {
        map.setView([lat, lng], 15);
        L.marker([lat, lng]).addTo(map).bindPopup("Vị trí nhật ký").openPopup();
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
            <span>${s.name} <small style="color:#888;">(${s.category})</small></span>
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
        info.style.color = '#333';
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
            <span style="flex:1;">${item.text}</span>
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
                    <span>${cat}</span>
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
    if (map) map.remove();

    // Default to a central point if no geolocation
    map = L.map('map').setView([10.7769, 106.7009], 13); // TP.HCM

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load saved markers
    Object.keys(savedMarkers).forEach(type => {
        const pos = savedMarkers[type];
        addMarkerToMap(pos.lat, pos.lng, type);
    });

    // Try to get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 15);
            // Optional: add a 'current position' circle
            L.circle([pos.coords.latitude, pos.coords.longitude], {
                radius: 100,
                color: '#4CAF50',
                fillColor: '#4CAF50',
                fillOpacity: 0.3
            }).addTo(map).bindPopup("Vị trí hiện tại của bạn");
        }, err => {
            console.log("Geolocation error:", err);
        });
    }
}

function markCurrentLocation(type) {
    if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ GPS.");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;

        savedMarkers[type] = { lat: latitude, lng: longitude };
        localStorage.setItem('markers', JSON.stringify(savedMarkers));

        addMarkerToMap(latitude, longitude, type);
        map.setView([latitude, longitude], 15);
    }, err => {
        alert("Không thể lấy vị trí GPS. Hãy bật định vị.");
    });
}

function addMarkerToMap(lat, lng, type) {
    if (markers[type]) map.removeLayer(markers[type]);

    const colors = { start: '#28a745', dest: '#007bff', return: '#dc3545' };
    const labels = { start: 'Điểm Đi', dest: 'Điểm Đến', return: 'Điểm Về' };

    const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: colors[type] || 'blue',
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map)
    .bindPopup(labels[type])
    .openPopup();

    markers[type] = marker;
}
