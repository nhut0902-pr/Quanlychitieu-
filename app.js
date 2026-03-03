let currentSection = 'diary';
let map, markers = {}, polylines = {};
let watchId = null;
let currentKmh = 0;
let currentLocation = null;
let totalDistance = 0; // In meters
let lastLocation = null;
let lastKmNotified = 0;
let selectedPhotos = [];
let pipInterval = null;
let timerWorker = null;

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
        start_date_label: "Ngày bắt đầu:",
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
        pip_btn: "Bật Cửa Sổ Nổi (PiP)",
        pip_error: "Trình duyệt không hỗ trợ cửa sổ nổi (PiP).",
        no_diary: "Không tìm thấy nhật ký.",
        delete_confirm: "Bạn có chắc muốn xóa?",
        copy_success: "Đã copy tọa độ: ",
        notifications_title: "Thông Báo & Chạy Ngầm",
        notify_motion: "Thông báo khi di chuyển (>10km/h):",
        keep_alive: "Duy trì khi chạy ngầm (Âm thanh im lặng):",
        wake_lock: "Giữ màn hình luôn sáng (Wake Lock):",
        keep_alive_note: "* Bật cả 2 để PiP và GPS cập nhật chính xác nhất khi chuyển app.",
        trip_started_title: "Chuyến đi bắt đầu!",
        trip_started_body: "Bạn đang di chuyển với tốc độ trên 10km/h. Chúc bạn có một chuyến đi an toàn!",
        distance_notif: "Bạn đã di chuyển được {n} km. (📍 {coords})",
        milestone_saved: "Đã lưu mốc {n} km!",
        milestone_history: "Lịch sử mốc quãng đường",
        no_milestones: "Chưa có mốc quãng đường nào",
        total_distance: "Quãng đường: ",
        prep_2days_title: "Chuẩn bị hành lý!",
        prep_2days_body: "Còn 2 ngày nữa là đến chuyến đi {name}. Hãy kiểm tra lại danh sách chuẩn bị nhé!",
        prep_evening_title: "Chuyến đi sắp bắt đầu!",
        prep_evening_body: "Tối nay chuyến đi {name} sẽ chính thức bắt đầu. Chúc bạn có một hành trình tuyệt vời!",
        notify_unsupported: "Trình duyệt của bạn không hỗ trợ thông báo.",
        notify_denied: "Bạn cần cấp quyền thông báo để sử dụng tính năng này.",
        trip_count: "mục nhật ký",
        spend_count: "khoản chi",
        delete_btn: "Xóa"
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
        start_date_label: "Start Date:",
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
        pip_btn: "Floating Window (PiP)",
        pip_error: "Browser does not support Picture-in-Picture.",
        no_diary: "No diaries found.",
        delete_confirm: "Are you sure you want to delete?",
        copy_success: "Coordinates copied: ",
        notifications_title: "Notifications & Background",
        notify_motion: "Notify when moving (>10km/h):",
        keep_alive: "Background Keep-Alive (Silent Audio):",
        wake_lock: "Keep Screen Awake (Wake Lock):",
        keep_alive_note: "* Enable both for best PiP/GPS updates in background.",
        trip_started_title: "Trip Started!",
        trip_started_body: "You are moving at over 10km/h. Have a safe journey!",
        distance_notif: "You have traveled {n} km. (📍 {coords})",
        milestone_saved: "Milestone {n} km saved!",
        milestone_history: "Distance Milestones",
        no_milestones: "No milestones yet",
        total_distance: "Distance: ",
        prep_2days_title: "Prepare your luggage!",
        prep_2days_body: "2 days left until {name}. Check your checklist!",
        prep_evening_title: "Trip starting soon!",
        prep_evening_body: "Trip {name} starts tonight. Have a great journey!",
        notify_unsupported: "Your browser does not support notifications.",
        notify_denied: "You need to grant notification permission to use this feature.",
        trip_count: "diaries",
        spend_count: "expenses",
        delete_btn: "Delete"
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
let motionNotifyEnabled = localStorage.getItem('motionNotifyEnabled') === 'true';
let keepAliveEnabled = localStorage.getItem('keepAliveEnabled') === 'true';
let wakeLockEnabled = localStorage.getItem('wakeLockEnabled') === 'true';
let hasNotifiedStart = false;
let wakeLock = null;
let audioContext = null;

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
let milestones = [];
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
        milestones = trip.milestones || [];
        totalDistance = trip.totalDistance || 0;
        lastKmNotified = Math.floor(totalDistance / 1000);
        checklist = trip.checklist || [];
        emergencyInfo = trip.emergencyInfo || '';
    } else {
        diaries = []; spendings = []; budget = 1000000; savedMarkers = {}; milestones = []; totalDistance = 0; lastKmNotified = 0; checklist = []; emergencyInfo = '';
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
        trips[index].milestones = milestones;
        trips[index].totalDistance = totalDistance;
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
            startDate: new Date().toISOString().split('T')[0],
            diaries: JSON.parse(localStorage.getItem('diaries')) || [],
            spendings: JSON.parse(localStorage.getItem('spendings')) || [],
            budget: parseFloat(localStorage.getItem('budget')) || 1000000,
            markers: JSON.parse(localStorage.getItem('markers')) || {},
            checklist: JSON.parse(localStorage.getItem('checklist')) || [],
            emergencyInfo: localStorage.getItem('emergencyInfo') || '',
            notifiedPrep: []
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
    checkTripPrepNotifications();
    startGlobalGpsWatch();

    // Auto-restore background modes if enabled
    if (keepAliveEnabled) toggleKeepAlive(true);
    if (wakeLockEnabled) toggleWakeLock(true);
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

function startGlobalGpsWatch() {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude, speed, accuracy } = pos.coords;

            // Accuracy check to avoid distance jumping when static
            if (accuracy > 30) return;

            currentKmh = speed ? Math.round(speed * 3.6) : 0;
            const newLocation = [latitude, longitude];

            // Update distance
            if (lastLocation) {
                const dist = calculateDistance(lastLocation[0], lastLocation[1], latitude, longitude);
                // Filter out small GPS jitters if speed is nearly zero
                if (dist > 2 && (speed > 0.5 || dist > 10)) {
                    totalDistance += dist;
                }
            }
            lastLocation = newLocation;
            currentLocation = newLocation;

            // Check for KM notifications
            const currentKm = Math.floor(totalDistance / 1000);
            if (currentKm > lastKmNotified && currentKm > 0) {
                const milestoneCoords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                recordMilestone(currentKm, milestoneCoords);
                sendDistanceNotification(currentKm, milestoneCoords);
                lastKmNotified = currentKm;
            }

            // Update UI
            const speedEl = document.getElementById('speed-value');
            if (speedEl) speedEl.innerText = currentKmh;

            const distEl = document.getElementById('total-distance-value');
            if (distEl) distEl.innerText = (totalDistance / 1000).toFixed(2);

            // Trigger PiP update immediately on location change
            if (document.pictureInPictureElement) {
                updatePipCanvas();
            }

            // Check for trip start notification (> 10km/h)
            if (currentKmh >= 10 && !hasNotifiedStart) {
                sendTripStartedNotification();
                hasNotifiedStart = true;
            } else if (currentKmh < 5) {
                hasNotifiedStart = false;
            }

            // Update current marker on map if it exists and section is map
            if (currentSection === 'map' && map) {
                if (!markers.current && currentLocation) {
                    markers.current = L.circleMarker(currentLocation, {
                        radius: 10, fillColor: '#2196F3', color: '#fff', weight: 3, fillOpacity: 1
                    }).addTo(map).bindPopup(`Bạn đang ở đây`);
                    if (Object.keys(savedMarkers).length === 0) map.setView(currentLocation, 15);
                } else if (markers.current) {
                    markers.current.setLatLng(currentLocation);
                }
            }
        }, null, { enableHighAccuracy: true });
    }
}

function sendDistanceNotification(km, coords) {
    if (motionNotifyEnabled && Notification.permission === "granted") {
        sendNotification(
            translations[currentLang].nav_diary,
            translations[currentLang].distance_notif.replace('{n}', km).replace('{coords}', coords)
        );
    }
}

function recordMilestone(km, coords) {
    const milestone = {
        km: km,
        coords: coords,
        time: Date.now()
    };
    milestones.push(milestone);
    syncTripData();
    if (currentSection === 'map') renderMilestones();
}

function renderMilestones() {
    const list = document.getElementById('milestone-list');
    if (!list) return;
    if (milestones.length === 0) {
        list.innerHTML = `<li style="text-align:center; color:#888; font-size:12px;">${translations[currentLang].no_milestones}</li>`;
        return;
    }
    list.innerHTML = milestones.slice().reverse().map(m => `
        <li style="font-size:12px; border-bottom:1px solid #eee; padding:5px 0;">
            <strong>${m.km} km</strong> - <small>${new Date(m.time).toLocaleTimeString()}</small><br>
            <span style="color:#666;">📍 ${m.coords}</span>
        </li>
    `).join('');
}

function checkTripPrepNotifications() {
    if (!motionNotifyEnabled || Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    trips.forEach(trip => {
        if (!trip.startDate) return;
        if (!trip.notifiedPrep) trip.notifiedPrep = [];

        const startDate = new Date(trip.startDate);
        const diffTime = startDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 2 days before
        if (diffDays === 2 && !trip.notifiedPrep.includes('2days')) {
            sendNotification(
                translations[currentLang].prep_2days_title,
                translations[currentLang].prep_2days_body.replace('{name}', trip.name)
            );
            trip.notifiedPrep.push('2days');
            saveTrips();
        }

        // Evening of the trip start day (e.g., if now is after 18:00)
        if (trip.startDate === todayStr && now.getHours() >= 18 && !trip.notifiedPrep.includes('evening')) {
            sendNotification(
                translations[currentLang].prep_evening_title,
                translations[currentLang].prep_evening_body.replace('{name}', trip.name)
            );
            trip.notifiedPrep.push('evening');
            saveTrips();
        }
    });
}

function sendNotification(title, body) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: 'https://img.icons8.com/color/96/000000/map-marker.png',
                vibrate: [200, 100, 200],
                badge: 'https://img.icons8.com/color/96/000000/map-marker.png',
                tag: 'trip-notification-' + Date.now()
            });
        });
    } else {
        new Notification(title, { body, icon: 'https://img.icons8.com/color/96/000000/map-marker.png' });
    }
}

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
    }

    if (section === 'settings') initSettings();
}

// --- Trips Logic ---
function initTrips() {
    renderTrips();
    document.getElementById('trip-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('trip-name').value;
        const startDate = document.getElementById('trip-start-date').value;
        const newTrip = {
            id: Date.now(),
            name: name,
            startDate: startDate,
            diaries: [],
            spendings: [],
            budget: 1000000,
            markers: {},
            checklist: [],
            emergencyInfo: '',
            notifiedPrep: []
        };
        trips.push(newTrip);
        saveTrips();
        renderTrips();
        e.target.reset();
    };
}

function renderTrips() {
    const list = document.getElementById('trip-list');
    const diaryText = translations[currentLang].trip_count;
    const spendText = translations[currentLang].spend_count;
    const deleteText = translations[currentLang].delete_btn;

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
    const notifyToggle = document.getElementById('notify-motion-toggle');
    if (notifyToggle) notifyToggle.checked = motionNotifyEnabled;
    const keepToggle = document.getElementById('keep-alive-toggle');
    if (keepToggle) keepToggle.checked = keepAliveEnabled;
    const wakeToggle = document.getElementById('wake-lock-toggle');
    if (wakeToggle) wakeToggle.checked = wakeLockEnabled;
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

function toggleKeepAlive(enabled) {
    keepAliveEnabled = enabled;
    localStorage.setItem('keepAliveEnabled', enabled);
    if (enabled) {
        startSilentAudio();
    } else {
        stopSilentAudio();
    }
}

function startSilentAudio() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();

        // We create a very slight vibration in the "silence" to keep the OS audio engine awake
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Very tiny amount of noise (nearly inaudible but keeps the stream active)
            output[i] = (Math.random() * 2 - 1) * 0.0001;
        }

        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(audioContext.destination);
        whiteNoise.start();
        window.silentAudioSource = whiteNoise;
    } catch (e) { console.error("Audio KeepAlive Error:", e); }
}

function stopSilentAudio() {
    if (window.silentAudioSource) {
        window.silentAudioSource.stop();
        window.silentAudioSource = null;
    }
}

async function toggleWakeLock(enabled) {
    wakeLockEnabled = enabled;
    localStorage.setItem('wakeLockEnabled', enabled);
    if (enabled) {
        try {
            if ('wakeLock' in navigator) {
                wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (err) { console.error("WakeLock Error:", err); }
    } else {
        if (wakeLock) {
            wakeLock.release();
            wakeLock = null;
        }
    }
}

function toggleMotionNotify(enabled) {
    if (enabled) {
        if (!("Notification" in window)) {
            alert(translations[currentLang].notify_unsupported);
            document.getElementById('notify-motion-toggle').checked = false;
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
                alert(translations[currentLang].notify_denied);
                document.getElementById('notify-motion-toggle').checked = false;
                motionNotifyEnabled = false;
            } else {
                motionNotifyEnabled = true;
                localStorage.setItem('motionNotifyEnabled', 'true');
            }
        });
    } else {
        motionNotifyEnabled = false;
        localStorage.setItem('motionNotifyEnabled', 'false');
    }
}

function sendTripStartedNotification() {
    if (motionNotifyEnabled && Notification.permission === "granted") {
        sendNotification(
            translations[currentLang].trip_started_title,
            translations[currentLang].trip_started_body
        );
    }
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

    // Speedometer initial value
    renderMilestones();
    const speedEl = document.getElementById('speed-value');
    if (speedEl) speedEl.innerText = currentKmh;
    const distEl = document.getElementById('total-distance-value');
    if (distEl) distEl.innerText = (totalDistance / 1000).toFixed(2);

    // Use current location if available
    if (currentLocation) {
        markers.current = L.circleMarker(currentLocation, {
            radius: 10, fillColor: '#2196F3', color: '#fff', weight: 3, fillOpacity: 1
        }).addTo(map).bindPopup(`Bạn đang ở đây`);
        if (Object.keys(savedMarkers).length === 0) map.setView(currentLocation, 15);
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

async function togglePiP() {
    const video = document.getElementById('pip-video');
    if (!video) return;

    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            if (!document.pictureInPictureEnabled) {
                alert(translations[currentLang].pip_error);
                return;
            }

            const canvas = document.getElementById('pip-canvas');
            // Ensure initial draw so the stream isn't empty
            updatePipCanvas();

            // 5 FPS is enough for speed and saves battery in background
            const stream = canvas.captureStream(5);
            video.srcObject = stream;

            await new Promise((resolve, reject) => {
                video.onloadedmetadata = async () => {
                    try {
                        await video.play();
                        resolve();
                    } catch (e) { reject(e); }
                };
                video.onerror = (e) => reject(e);
            });

            await video.requestPictureInPicture();
            startPipRendering();
        }
    } catch (err) {
        console.error("PiP Toggle Error:", err);
        alert("Lỗi khi bật Cửa sổ nổi: " + err.message);
    }
}

function updatePipCanvas() {
    const canvas = document.getElementById('pip-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Speedometer
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentKmh, 150, 120);
    ctx.font = '20px monospace';
    ctx.fillText('km/h', 150, 150);

    // Simplified Map info
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    if (currentLocation) {
        ctx.fillText(`KM: ${(totalDistance/1000).toFixed(2)} | GPS: ${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}`, 150, 190);
    }

    // Draw a small circle for current position relative to Start/Dest
    const trip = getCurrentTrip();
    if (trip && trip.markers && trip.markers.start && trip.markers.dest) {
         ctx.strokeStyle = '#3f51b5';
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.moveTo(50, 240);
         ctx.lineTo(250, 240);
         ctx.stroke();

         // Start marker
         ctx.fillStyle = '#28a745';
         ctx.beginPath(); ctx.arc(50, 240, 5, 0, Math.PI*2); ctx.fill();

         // Dest marker
         ctx.fillStyle = '#007bff';
         ctx.beginPath(); ctx.arc(250, 240, 5, 0, Math.PI*2); ctx.fill();

         // Current Position estimate (linear approximation)
         ctx.fillStyle = '#f00';
         // Rough percentage calculation
         ctx.beginPath(); ctx.arc(150, 240, 7, 0, Math.PI*2); ctx.fill();
    }
}

function startPipRendering() {
    if (pipInterval) clearInterval(pipInterval);
    if (timerWorker) timerWorker.terminate();

    // Use Web Worker for background-resilient timing
    const workerCode = `
        let intervalId = null;
        self.onmessage = function(e) {
            if (e.data === 'start') {
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(() => self.postMessage('tick'), 1000);
            } else if (e.data === 'stop') {
                if (intervalId) clearInterval(intervalId);
                intervalId = null;
            }
        };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    timerWorker = new Worker(URL.createObjectURL(blob));

    timerWorker.onmessage = () => {
        if (document.pictureInPictureElement) {
            updatePipCanvas();
        } else {
            if (timerWorker) {
                timerWorker.postMessage('stop');
                timerWorker.terminate();
                timerWorker = null;
            }
        }
    };

    timerWorker.postMessage('start');

    // Fallback interval in case Worker fails
    pipInterval = setInterval(() => {
        if (!document.pictureInPictureElement) {
            clearInterval(pipInterval);
            pipInterval = null;
            return;
        }
        updatePipCanvas();
    }, 2000);
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
