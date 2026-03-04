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
        nav_itinerary: "Lịch Trình",
        nav_weather: "Thời Tiết",
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
        cat_food: "Ăn uống",
        cat_transport: "Di chuyển",
        cat_hotel: "Lưu trú",
        cat_other: "Khác",
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
        distance_notif: "Bạn đã di chuyển được {n} km. ({coords})",
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
        delete_btn: "Xóa",
        add_photo: "Thêm Ảnh",
        itinerary_title: "Lịch Trình Chuyến Đi",
        add_itinerary: "Thêm Lịch Trình",
        activity_placeholder: "Hoạt động (vd: Tham quan Dinh Bảo Đại)",
        location_placeholder: "Địa điểm",
        time_placeholder: "Thời gian",
        no_itinerary: "Chưa có lịch trình nào.",
        pdf_config_title: "Tùy Chỉnh Báo Cáo PDF",
        pdf_template_label: "Chọn mẫu thiết kế:",
        pdf_font_label: "Font chữ:",
        pdf_color_label: "Màu nhấn chủ đạo:",
        pdf_preview_label: "Xem trước:",
        pdf_preview_empty: "Chọn mẫu để xem trước",
        cancel_btn: "Hủy",
        export_btn: "Tải xuống PDF",
        emergency_placeholder: "Liên hệ người thân, nhóm máu, dị ứng...",
        help_btn: "Hướng Dẫn Sử Dụng",
        terms_btn: "Điều Khoản & Bảo Mật",
        updates_btn: "Bản Cập Nhật",
        help_title: "Hướng Dẫn Sử Dụng",
        terms_title: "Điều Khoản & Quyền Riêng Tư",
        updates_title: "Thông Tin Bản Cập Nhật 1.2.3",
        update_notice: "Có bản cập nhật mới (1.2.3)!",
        manual_content: "• Nhật ký: Ghi lại hành trình, ảnh và đánh giá.<br>• Lịch trình: Lên kế hoạch thời gian cho chuyến đi.<br>• Thời tiết: Xem dự báo 5 ngày, cập nhật bằng GPS và hỗ trợ offline.<br>• Chi tiêu: Quản lý ngân sách và xem biểu đồ.<br>• Bản đồ: Đánh dấu GPS và theo dõi tốc độ (hỗ trợ PiP).<br>• Xuất PDF: Tạo báo cáo đẹp mắt để lưu niệm.",
        terms_content: "Dữ liệu của bạn được lưu hoàn toàn trên thiết bị (Offline). Chúng tôi không thu thập bất kỳ thông tin nào. Sử dụng GPS chỉ phục vụ mục đích đánh dấu vị trí và đo tốc độ trong ứng dụng.",
        updates_content: "<b>Phiên bản 1.2.3</b><br><br>Tính năng mới:<br>• Chuyển sang sử dụng WeatherAPI.com cho dữ liệu thời tiết chính xác hơn.<br>• Thêm nút cập nhật thời tiết nhanh bằng GPS.<br>• Cho phép tự cấu hình Mã API Key trong phần Cài đặt.<br>• Dự báo thời tiết chi tiết 5 ngày.<br><br>Lỗi đã sửa:<br>• Sửa lỗi nút tìm kiếm thời tiết không hoạt động.<br>• Cải thiện giao diện hiển thị thời tiết trên di động.",
        weather_title: "Dự Báo Thời Tiết",
        weather_search_placeholder: "Nhập tên thành phố...",
        weather_loading: "Đang lấy dữ liệu...",
        weather_error: "Lỗi kết nối hoặc không tìm thấy địa điểm.",
        weather_offline_msg: "Thông tin thời tiết cần kết nối mạng để cập nhật.",
        weather_feels_like: "Cảm giác như",
        weather_humidity: "Độ ẩm",
        weather_wind: "Gió",
        weather_get_current: "Cập nhật thời tiết bằng GPS",
        weather_manual_update: "Cập nhật thủ công (Offline)",
        weather_last_updated: "Cập nhật lúc: ",
        weather_manual_temp: "Nhiệt độ (°C):",
        weather_manual_desc: "Tình trạng (vd: Nắng, Mưa):",
        manual_temp_placeholder: "25",
        manual_desc_placeholder: "Nắng đẹp",
        weather_api_key_label: "Mã WeatherAPI.com (Key):",
        weather_provider: "Dịch vụ thời tiết:",
        owm_api_key_label: "Mã OpenWeatherMap (Key):",
        weather_map_hint: "Chọn vị trí trên bản đồ để xem thời tiết:"
    },
    en: {
        nav_diary: "Diary",
        nav_itinerary: "Itinerary",
        nav_weather: "Weather",
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
        cat_food: "Food",
        cat_transport: "Transport",
        cat_hotel: "Hotel",
        cat_other: "Other",
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
        distance_notif: "You have traveled {n} km. ({coords})",
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
        delete_btn: "Delete",
        add_photo: "Add Photo",
        itinerary_title: "Trip Itinerary",
        add_itinerary: "Add Itinerary",
        activity_placeholder: "Activity (e.g. Visit Eiffel Tower)",
        location_placeholder: "Location",
        time_placeholder: "Time",
        no_itinerary: "No itinerary items yet.",
        pdf_config_title: "Customize PDF Report",
        pdf_template_label: "Select template:",
        pdf_font_label: "Font family:",
        pdf_color_label: "Accent Color:",
        pdf_preview_label: "Preview:",
        pdf_preview_empty: "Select a template to preview",
        cancel_btn: "Cancel",
        export_btn: "Download PDF",
        emergency_placeholder: "Emergency contact, blood type, allergies...",
        help_btn: "User Manual",
        terms_btn: "Terms & Privacy",
        updates_btn: "What's New",
        help_title: "User Manual",
        terms_title: "Terms & Privacy",
        updates_title: "Update 1.2.3 Info",
        update_notice: "New update available (1.2.3)!",
        manual_content: "• Diary: Log journey, photos and ratings.<br>• Itinerary: Plan your trip schedule.<br>• Weather: 5-day forecast, GPS update, and hybrid offline support.<br>• Spending: Manage budget and view charts.<br>• Map: Mark GPS points and track speed (PiP supported).<br>• Export PDF: Create beautiful reports for memories.",
        terms_content: "Your data is stored entirely on your device (Offline). We do not collect any information. GPS usage is only for marking locations and speed tracking within the app.",
        updates_content: "<b>Version 1.2.3</b><br><br>New Features:<br>• Switched to WeatherAPI.com for more accurate data.<br>• Added one-tap Weather Update via GPS.<br>• Support custom API Key configuration in Settings.<br>• Expanded to 5-day weather forecast.<br><br>Bug Fixes:<br>• Fixed weather search button not responding.<br>• Improved weather UI for mobile devices.",
        weather_title: "Weather Forecast",
        weather_search_placeholder: "Enter city name...",
        weather_loading: "Loading weather...",
        weather_error: "Connection error or location not found.",
        weather_offline_msg: "Weather updates require internet connection.",
        weather_feels_like: "Feels like",
        weather_humidity: "Humidity",
        weather_wind: "Wind",
        weather_get_current: "Update weather via GPS",
        weather_manual_update: "Manual Update (Offline)",
        weather_last_updated: "Last updated: ",
        weather_manual_temp: "Temperature (°C):",
        weather_manual_desc: "Condition (e.g. Sunny, Rain):",
        manual_temp_placeholder: "25",
        manual_desc_placeholder: "Clear sky",
        weather_api_key_label: "WeatherAPI.com Key:",
        weather_provider: "Weather Provider:",
        owm_api_key_label: "OpenWeatherMap Key:",
        weather_map_hint: "Select a location on the map to see weather:"
    }
};

let currentLang = localStorage.getItem('lang') || 'vi';
let primaryColor = localStorage.getItem('primaryColor') || '#6366f1';

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
let itineraries = [];
let spendings = [];
let budget = 1000000;
let savedMarkers = {};
let milestones = [];
let checklist = [];
let emergencyInfo = '';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--primary', color);
    // Also update RGB for transparency support
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

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
        'itinerary-activity': 'activity_placeholder',
        'itinerary-location': 'location_placeholder',
        'spend-item': 'item_placeholder',
        'spend-amount': 'price_placeholder',
        'checklist-item': 'checklist_placeholder',
        'emergency-info': 'emergency_placeholder',
        'weather-search': 'weather_search_placeholder',
        'manual-temp': 'manual_temp_placeholder',
        'manual-desc': 'manual_desc_placeholder'
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
        itineraries = trip.itineraries || [];
        spendings = trip.spendings || [];
        budget = trip.budget || 1000000;
        savedMarkers = trip.markers || {};
        milestones = trip.milestones || [];
        totalDistance = trip.totalDistance || 0;
        lastKmNotified = Math.floor(totalDistance / 1000);
        checklist = trip.checklist || [];
        emergencyInfo = trip.emergencyInfo || '';
    } else {
        diaries = []; itineraries = []; spendings = []; budget = 1000000; savedMarkers = {}; milestones = []; totalDistance = 0; lastKmNotified = 0; checklist = []; emergencyInfo = '';
    }
}

function syncTripData() {
    if (!currentTripId) return;
    const index = trips.findIndex(t => t.id == currentTripId);
    if (index !== -1) {
        trips[index].diaries = diaries;
        trips[index].itineraries = itineraries;
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
    updateThemeIcon();
    applyThemeColor(primaryColor);
    updateLanguage();

    const lastVersion = localStorage.getItem('lastAppVersion');
    const currentVersion = '1.2.3';
    if (lastVersion !== currentVersion) {
        setTimeout(() => {
            showUpdates();
            localStorage.setItem('lastAppVersion', currentVersion);
        }, 1000);
    }

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
                        radius: 10, fillColor: '#6366f1', color: '#fff', weight: 3, fillOpacity: 1
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
        <li style="font-size:12px; border-bottom:1px solid var(--border); padding:8px 0;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${m.km} km</strong>
                <small style="color:var(--text-muted);">${new Date(m.time).toLocaleTimeString()}</small>
            </div>
            <div style="color:var(--text-muted); display:flex; align-items:center; gap:4px; margin-top:2px;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${m.coords}</span>
            </div>
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
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    if (isDarkMode) {
        // Sun icon
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
        // Moon icon
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
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
    const titleElements = ['diary', 'itinerary', 'spending', 'settings', 'map'];
    titleElements.forEach(elId => {
        const el = document.getElementById(`current-trip-title-${elId}`);
        if (el && trip) el.innerText = trip.name;
    });

    if (section === 'diary') initDiary();
    if (section === 'itinerary') initItinerary();
    if (section === 'weather') initWeather();
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
            itineraries: [],
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
        <div class="diary-item ${t.id == currentTripId ? 'active-trip' : ''}" style="cursor:pointer; border-left: 4px solid ${t.id == currentTripId ? 'var(--primary)' : 'transparent'}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div onclick="switchTrip(${t.id})" style="flex:1;">
                    <div style="font-weight:700; font-size:16px; margin-bottom:4px;">${escapeHTML(t.name)}</div>
                    <div style="display:flex; gap:12px; color:var(--text-muted); font-size:12px;">
                        <span style="display:flex; align-items:center; gap:4px;" title="Diaries"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21,4H3A2,2 0 0,0 1,6V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V6A2,2 0 0,0 21,4M21,19H3V6H21V19M19,9H5V7H19V9M19,13H5V11H19V13M19,17H5V15H19V17Z"/></svg> ${t.diaries.length}</span>
                        <span style="display:flex; align-items:center; gap:4px;" title="Itinerary"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V9H19V19M19,7H5V5H19V7M7,11H12V13H7V11M7,15H17V17H7V15Z"/></svg> ${t.itineraries ? t.itineraries.length : 0}</span>
                        <span style="display:flex; align-items:center; gap:4px;" title="Expenses"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18H21M12,16H22V8H12V16M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z"/></svg> ${t.spendings.length}</span>
                    </div>
                    <div style="margin-top:4px; font-size:11px; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>${t.startDate || '---'}</span>
                    </div>
                </div>
                <button onclick="deleteTrip(${t.id})" style="background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:8px; border-radius:8px;">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
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

function getRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const color = i <= rating ? '#fbbf24' : '#e5e7eb';
        stars += `<svg viewBox="0 0 24 24" width="14" height="14" fill="${color}" style="margin-right:1px;"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>`;
    }
    return stars;
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
        list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 40px 0;">${translations[currentLang].no_diary}</p>`;
        return;
    }

    const deleteText = translations[currentLang].delete_btn;
    const viewMapText = currentLang === 'vi' ? 'Xem bản đồ' : 'View map';

    list.innerHTML = '';
    for (const d of filtered.slice().reverse()) {
        const item = document.createElement('div');
        item.className = 'diary-item';

        let photosHtml = '';
        if (d.hasPhotos) {
            const photos = await getPhotos(d.id);
            photosHtml = `<div style="display:flex; gap:8px; margin-top:12px; overflow-x:auto; padding-bottom:4px;">
                ${photos.map(p => `<img src="${p}" style="height:100px; width:auto; border-radius:var(--radius); object-fit:cover;" onclick="viewFullImage('${p}')">`).join('')}
            </div>`;
        }

        const coordsDisplay = d.coords ? `
            <div style="font-size:12px; color:var(--text-muted); margin-top:12px; background:var(--bg-body); padding:8px 12px; border-radius:8px; border: 1px solid var(--border); display:flex; align-items:center; gap:8px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.coords}</span>
                <button onclick="copyCoords('${d.coords}')" style="background:none; border:none; color:var(--primary); font-weight:600; padding:4px; font-size:11px;">COPY</button>
            </div>
        ` : '';

        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <strong style="font-size:16px;">${escapeHTML(d.start)}</strong>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        <strong style="font-size:16px;">${escapeHTML(d.end)}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; color:var(--text-muted); font-size:13px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>${new Date(d.time).toLocaleString(currentLang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                     <button onclick="deleteDiary(${d.id})" style="background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:6px; border-radius:6px; line-height:0;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                     </button>
                     <div style="display:flex;">${getRatingStars(d.rating)}</div>
                </div>
            </div>
            <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
                <div style="display:flex; align-items:flex-start; gap:8px;">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-top:2px; flex-shrink:0;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                    <em style="color:var(--text-body); font-style:normal; font-size:14px;">${escapeHTML(d.food) || (currentLang === 'vi' ? 'Chưa có ghi chú món ăn' : 'No food notes')}</em>
                </div>
                ${photosHtml}
                ${coordsDisplay}
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                        <span style="color:#10b981; font-weight:700; font-size:16px;">${Number(d.cost || 0).toLocaleString()}đ</span>
                    </div>
                    ${d.coords ? `<button onclick="showOnMap(${d.coords})" style="padding:6px 12px; font-size:12px; background:var(--bg-body); color:var(--text-body); border:1px solid var(--border); border-radius:6px; display:flex; align-items:center; gap:4px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${viewMapText}
                    </button>` : ''}
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

// --- Itinerary Logic ---
function initItinerary() {
    renderItinerary();
    const form = document.getElementById('itinerary-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const item = {
                id: Date.now(),
                activity: document.getElementById('itinerary-activity').value,
                location: document.getElementById('itinerary-location').value,
                time: document.getElementById('itinerary-time').value
            };
            itineraries.push(item);
            syncTripData();
            renderItinerary();
            e.target.reset();
        };
    }
}

function renderItinerary() {
    const list = document.getElementById('itinerary-list');
    if (!list) return;
    if (itineraries.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 40px 0;">${translations[currentLang].no_itinerary}</p>`;
        return;
    }

    // Sort itinerary by time
    const sorted = itineraries.slice().sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

    list.innerHTML = sorted.map(item => `
        <div class="diary-item" style="margin-bottom:12px; padding:12px 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${item.time ? `<span style="font-weight:700; color:var(--primary); font-size:14px; background:rgba(var(--primary-rgb),0.1); padding:2px 6px; border-radius:4px;">${item.time}</span>` : ''}
                        <strong style="margin:0; font-size:15px; color:var(--text-main);">${escapeHTML(item.activity)}</strong>
                    </div>
                    ${item.location ? `
                        <div style="display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-muted); margin-top:4px;">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>${escapeHTML(item.location)}</span>
                        </div>
                    ` : ''}
                </div>
                <button onclick="deleteItinerary(${item.id})" style="background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:6px; border-radius:6px; line-height:0;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteItinerary(id) {
    if (confirm(translations[currentLang].delete_confirm)) {
        itineraries = itineraries.filter(i => i.id !== id);
        syncTripData();
        renderItinerary();
    }
}

// --- Weather Logic (Hybrid Providers) ---
let weatherProvider = localStorage.getItem('weatherProvider') || 'weatherapi';
let weatherapi_key = localStorage.getItem('weatherapi_key') || '';
let openweather_key = localStorage.getItem('openweather_key') || '';
let weatherMiniMap = null;
let weatherMarker = null;

function changeWeatherProvider(provider) {
    weatherProvider = provider;
    localStorage.setItem('weatherProvider', provider);

    // Update key container visibility if on settings page
    const wapiContainer = document.getElementById('weatherapi-key-container');
    const owmContainer = document.getElementById('openweathermap-key-container');
    if (wapiContainer && owmContainer) {
        wapiContainer.style.display = provider === 'weatherapi' ? 'flex' : 'none';
        owmContainer.style.display = provider === 'openweathermap' ? 'flex' : 'none';
    }

    if (currentSection === 'weather') initWeather();
}

function updateWeatherKey(provider, key) {
    if (provider === 'weatherapi') {
        weatherapi_key = key;
        localStorage.setItem('weatherapi_key', key);
    } else {
        openweather_key = key;
        localStorage.setItem('openweather_key', key);
    }
    alert(currentLang === 'vi' ? "Đã lưu mã API mới!" : "New API Key saved!");
}

function initWeather() {
    const form = document.getElementById('weather-form');
    if (form) {
        form.onsubmit = null;
        form.onsubmit = (e) => {
            e.preventDefault();
            const city = document.getElementById('weather-search').value;
            if (city.trim()) {
                if (weatherProvider === 'weatherapi') fetchWeatherData(city);
                else fetchOWMDataByCity(city);
            }
            return false;
        };
    }

    // Toggle Map visibility
    const mapContainer = document.getElementById('weather-map-container');
    if (mapContainer) {
        mapContainer.style.display = weatherProvider === 'openweathermap' ? 'block' : 'none';
        if (weatherProvider === 'openweathermap') initWeatherMiniMap();
    }

    const manualForm = document.getElementById('weather-manual-form');
    if (manualForm) {
        manualForm.onsubmit = (e) => {
            e.preventDefault();
            const temp = document.getElementById('manual-temp').value;
            const desc = document.getElementById('manual-desc').value;
            saveManualWeather(temp, desc);
        };
    }

    // Load cached weather if exists
    const cached = JSON.parse(localStorage.getItem('weather_cache'));
    if (cached) {
        renderWeather(cached, true);
        if (cached.forecast) renderForecast(cached.forecast);
    }

    // Auto-fetch current location weather if possible
    if (currentLocation) {
        fetchWeatherData(`${currentLocation[0]},${currentLocation[1]}`);
    }
}

function saveManualWeather(temp, desc) {
    const manualData = {
        name: currentLang === 'vi' ? 'Thủ công' : 'Manual',
        country: '---',
        desc: desc,
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/113.png',
        temp: temp,
        feelslike: temp,
        humidity: '--',
        wind: '--',
        isManual: true,
        timestamp: Date.now()
    };
    renderWeather(manualData);
    localStorage.setItem('weather_cache', JSON.stringify(manualData));
    document.getElementById('weather-forecast').innerHTML = ''; // Clear forecast for manual entry
}

async function fetchWeatherData(query) {
    if (!weatherapi_key && weatherProvider === 'weatherapi') {
        updateWeatherMsg(currentLang === 'vi' ? "Vui lòng nhập API Key trong Cài đặt" : "Please enter API Key in Settings");
        return;
    }
    updateWeatherMsg(translations[currentLang].weather_loading);
    try {
        const langCode = currentLang === 'vi' ? 'vi' : 'en';
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherapi_key}&q=${query}&days=5&aqi=no&alerts=no&lang=${langCode}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.error) {
            const weatherData = {
                name: data.location.name,
                country: data.location.country,
                desc: data.current.condition.text,
                icon: 'https:' + data.current.condition.icon,
                temp: Math.round(data.current.temp_c),
                feelslike: Math.round(data.current.feelslike_c),
                humidity: data.current.humidity,
                wind: data.current.wind_kph,
                timestamp: Date.now(),
                forecast: data.forecast.forecastday.map(f => ({
                    date_epoch: f.date_epoch,
                    temp: Math.round(f.day.avgtemp_c),
                    icon: 'https:' + f.day.condition.icon
                }))
            };

            renderWeather(weatherData);
            renderForecast(weatherData.forecast);
            localStorage.setItem('weather_cache', JSON.stringify(weatherData));
        } else {
            updateWeatherMsg(translations[currentLang].weather_error);
        }
    } catch (err) {
        handleWeatherError();
    }
}

async function fetchOWMDataByCity(city) {
    if (!openweather_key) return alert(currentLang === 'vi' ? "Vui lòng nhập OpenWeatherMap Key trong Cài đặt" : "Please enter OpenWeatherMap Key in Settings");
    updateWeatherMsg(translations[currentLang].weather_loading);
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openweather_key}&units=metric&lang=${currentLang}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.cod == 200) {
            fetchOWMForecast(data.coord.lat, data.coord.lon, data);
        } else {
            updateWeatherMsg(translations[currentLang].weather_error);
        }
    } catch (e) { handleWeatherError(); }
}

async function fetchOWMDataByCoords(lat, lon) {
    if (!openweather_key) return alert("Missing OWM Key");
    updateWeatherMsg(translations[currentLang].weather_loading);
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openweather_key}&units=metric&lang=${currentLang}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.cod == 200) {
            fetchOWMForecast(lat, lon, data);
        } else {
            updateWeatherMsg(translations[currentLang].weather_error);
        }
    } catch (e) { handleWeatherError(); }
}

async function fetchOWMForecast(lat, lon, currentData) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openweather_key}&units=metric&lang=${currentLang}`;
        const resp = await fetch(url);
        const data = await resp.json();

        // Process OWM 5-day/3-hour forecast to daily
        const daily = [];
        const seenDates = new Set();
        data.list.forEach(item => {
            const dateStr = item.dt_txt.split(' ')[0];
            if (!seenDates.has(dateStr)) {
                seenDates.add(dateStr);
                daily.push({
                    date_epoch: item.dt,
                    temp: Math.round(item.main.temp),
                    icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
                });
            }
        });

        const weatherData = {
            name: currentData.name,
            country: currentData.sys.country,
            desc: currentData.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
            temp: Math.round(currentData.main.temp),
            feelslike: Math.round(currentData.main.feels_like),
            humidity: currentData.main.humidity,
            wind: Math.round(currentData.wind.speed * 3.6),
            timestamp: Date.now(),
            forecast: daily.slice(0, 5)
        };

        renderWeather(weatherData);
        renderForecast(weatherData.forecast);
        localStorage.setItem('weather_cache', JSON.stringify(weatherData));
    } catch (e) { handleWeatherError(); }
}

function handleWeatherError() {
    const cached = JSON.parse(localStorage.getItem('weather_cache'));
    if (cached) {
        renderWeather(cached, true);
    } else {
        updateWeatherMsg(translations[currentLang].weather_offline_msg);
    }
}

function initWeatherMiniMap() {
    setTimeout(() => {
        const mapEl = document.getElementById('weather-mini-map');
        if (!mapEl) return;
        if (weatherMiniMap) {
            weatherMiniMap.remove();
        }

        let center = currentLocation || [10.7769, 106.7009];
        weatherMiniMap = L.map('weather-mini-map').setView(center, 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(weatherMiniMap);

        weatherMiniMap.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (weatherMarker) weatherMiniMap.removeLayer(weatherMarker);
            weatherMarker = L.marker([lat, lng]).addTo(weatherMiniMap);
            fetchOWMDataByCoords(lat, lng);
        });

        if (currentLocation) {
            weatherMarker = L.marker(currentLocation).addTo(weatherMiniMap);
        }
    }, 300);
}

function getWeatherAtCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            if (weatherProvider === 'weatherapi') {
                fetchWeatherData(`${pos.coords.latitude},${pos.coords.longitude}`);
            } else {
                fetchOWMDataByCoords(pos.coords.latitude, pos.coords.longitude);
            }
        }, (err) => {
            alert("Lỗi GPS: " + err.message);
        }, { enableHighAccuracy: true });
    } else {
        alert("Trình duyệt không hỗ trợ định vị");
    }
}

function updateWeatherMsg(msg) {
    const el = document.getElementById('weather-msg');
    const display = document.getElementById('weather-display');
    if (el) {
        el.innerText = msg;
        el.style.display = 'block';
    }
    if (display) display.style.display = 'none';
}

function renderWeather(data) {
    const display = document.getElementById('weather-display');
    const msg = document.getElementById('weather-msg');
    if (!display) return;

    msg.style.display = 'none';
    display.style.display = 'block';

    const timeStr = data.timestamp ? new Date(data.timestamp).toLocaleString() : '';

    display.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <div style="font-size:18px; font-weight:700; margin-bottom:4px;">${data.name}, ${data.country}</div>
                <div style="text-transform: capitalize; opacity: 0.9; font-size:14px;">${data.desc}</div>
            </div>
            ${data.isManual ? '<span style="background:var(--primary); color:white; font-size:10px; padding:2px 6px; border-radius:10px;">OFFLINE</span>' : ''}
        </div>
        <div class="weather-temp">
            <img src="${data.icon}" width="80" height="80">
            <span>${data.temp}°C</span>
        </div>
        <div class="weather-details">
            <div class="weather-detail-item">
                <span style="opacity:0.7;">${translations[currentLang].weather_feels_like}</span>
                <strong>${data.feelslike}°C</strong>
            </div>
            <div class="weather-detail-item">
                <span style="opacity:0.7;">${translations[currentLang].weather_humidity}</span>
                <strong>${data.humidity}%</strong>
            </div>
            <div class="weather-detail-item">
                <span style="opacity:0.7;">${translations[currentLang].weather_wind}</span>
                <strong>${data.wind} km/h</strong>
            </div>
        </div>
        ${timeStr ? `<div style="text-align:center; font-size:11px; opacity:0.6; margin-top:12px;">${translations[currentLang].weather_last_updated} ${timeStr}</div>` : ''}
    `;
}

function renderForecast(forecastDays) {
    const grid = document.getElementById('weather-forecast');
    if (!grid) return;

    grid.innerHTML = forecastDays.map(f => {
        const date = new Date(f.date_epoch * 1000);
        const day = date.toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'numeric' });

        return `
            <div class="forecast-item">
                <div class="forecast-date">${day}</div>
                <img src="${f.icon}" width="40" height="40">
                <div class="forecast-temp">${f.temp}°C</div>
            </div>
        `;
    }).join('');
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
        list.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px 0;">Chưa có chi tiêu nào.</p>';
        return;
    }
    list.innerHTML = spendings.slice().reverse().map(s => `
        <li style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:12px 16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:600; font-size:15px; color:var(--text-body);">${escapeHTML(s.name)}</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${escapeHTML(s.category)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-weight:700; color:var(--primary); font-size:15px;">${s.amount.toLocaleString()}đ</span>
                <button onclick="deleteSpending(${s.id})" style="background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:6px; border-radius:6px; line-height:0;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
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

    if (!info || !progress) return;

    info.innerText = `${totalSpent.toLocaleString()} / ${Number(budget).toLocaleString()} đ`;
    const percentage = Math.min((totalSpent / budget) * 100, 100);
    progress.style.width = percentage + '%';

    if (totalSpent > budget) {
        progress.style.backgroundColor = 'var(--danger)';
        info.style.color = 'var(--danger)';
        info.style.fontWeight = '700';
    } else {
        progress.style.backgroundColor = percentage > 90 ? 'var(--warning)' : 'var(--primary)';
        info.style.color = 'var(--text-muted)';
        info.style.fontWeight = '500';
    }
}

function drawSpendingChart() {
    const canvas = document.getElementById('spending-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const legend = document.getElementById('chart-legend');

    const cats = ['Ăn uống', 'Di chuyển', 'Lưu trú', 'Khác'];
    // Modern palette
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    const data = cats.map(cat => spendings.filter(s => s.category === cat).reduce((sum, s) => sum + s.amount, 0));
    const total = data.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    legend.innerHTML = '';

    if (total === 0) {
        ctx.fillStyle = 'var(--border)';
        ctx.beginPath();
        ctx.arc(100, 100, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'var(--text-muted)';
        ctx.textAlign = 'center';
        ctx.fillText('No data', 100, 105);
        return;
    }

    let startAngle = -0.5 * Math.PI; // Start from top
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
        legend.innerHTML += `<div style="display:flex; align-items:center; gap:8px; padding:4px 0;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${colors[i]};"></span>
            <span style="flex:1;">${cats[i]}</span>
            <span style="font-weight:700;">${p}%</span>
        </div>`;
    });
}

// --- Settings & Utils Logic ---
function initSettings() {
    document.getElementById('emergency-info').value = emergencyInfo;
    const wapiKeyInput = document.getElementById('weatherapi-key-input');
    if (wapiKeyInput) wapiKeyInput.value = weatherapi_key;
    const oapiKeyInput = document.getElementById('owm-api-key-input');
    if (oapiKeyInput) oapiKeyInput.value = openweather_key;
    const providerSelect = document.getElementById('weather-provider-select');
    if (providerSelect) {
        providerSelect.value = weatherProvider;
        document.getElementById('weatherapi-key-container').style.display = weatherProvider === 'weatherapi' ? 'flex' : 'none';
        document.getElementById('openweathermap-key-container').style.display = weatherProvider === 'openweathermap' ? 'flex' : 'none';
    }
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
            <button onclick="deleteCheckItem(${item.id})" style="background:rgba(239, 68, 68, 0.1); color:#ef4444; border:none; padding:4px; border-radius:6px; line-height:0;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
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

const pdfTemplates = [
    { id: 'modern', name: 'Modern Travel', nameEn: 'Modern Travel' },
    { id: 'minimalist', name: 'Tối Giản', nameEn: 'Minimalist' },
    { id: 'adventure', name: 'Phiêu Lưu', nameEn: 'Adventure' },
    { id: 'classic', name: 'Cổ Điển', nameEn: 'Classic' },
    { id: 'magazine', name: 'Tạp Chí', nameEn: 'Magazine' },
    { id: 'scrapbook', name: 'Sổ Tay', nameEn: 'Scrapbook' },
    { id: 'dark-lux', name: 'Huyền Bí', nameEn: 'Dark Luxury' },
    { id: 'colorful', name: 'Sắc Màu', nameEn: 'Colorful' },
    { id: 'business', name: 'Công Tác', nameEn: 'Business' },
    { id: 'polaroid', name: 'Polaroid', nameEn: 'Polaroid Style' },
    { id: 'skyline', name: 'Thành Phố', nameEn: 'Urban Skyline' },
    { id: 'nature', name: 'Thiên Nhiên', nameEn: 'Nature Green' },
    { id: 'vintage', name: 'Hoài Cổ', nameEn: 'Vintage Paper' },
    { id: 'map-focus', name: 'Bản Đồ', nameEn: 'Map Focused' },
    { id: 'timeline', name: 'Dòng Thời Gian', nameEn: 'Timeline' }
];

let selectedTemplate = 'modern';

function generateTripReport() {
    const modal = document.getElementById('pdf-modal');
    modal.style.display = 'flex';

    const grid = document.getElementById('template-select');
    grid.innerHTML = pdfTemplates.map(t => `
        <div class="template-item ${t.id === selectedTemplate ? 'selected' : ''}" onclick="selectPdfTemplate('${t.id}')">
            ${currentLang === 'vi' ? t.name : t.nameEn}
        </div>
    `).join('');

    document.getElementById('pdf-accent-color').value = primaryColor;
    updatePdfPreview();
}

function selectPdfTemplate(id) {
    selectedTemplate = id;

    // Re-render template items to show selection
    const items = document.querySelectorAll('.template-item');
    items.forEach(item => {
        if (item.innerText.trim() === (currentLang === 'vi' ? pdfTemplates.find(t => t.id === id).name : pdfTemplates.find(t => t.id === id).nameEn)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    updatePdfPreview();
}

function closePdfModal() {
    document.getElementById('pdf-modal').style.display = 'none';
}

function showInfoModal(title, body) {
    document.getElementById('info-modal-title').innerText = title;
    document.getElementById('info-modal-body').innerHTML = body;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeInfoModal() {
    document.getElementById('info-modal').style.display = 'none';
}

function showManual() {
    showInfoModal(translations[currentLang].help_title, translations[currentLang].manual_content);
}

function showTerms() {
    showInfoModal(translations[currentLang].terms_title, translations[currentLang].terms_content);
}

function showUpdates() {
    showInfoModal(translations[currentLang].updates_title, translations[currentLang].updates_content);
}

async function updatePdfPreview() {
    const trip = getCurrentTrip();
    if (!trip) return;

    const font = document.getElementById('pdf-font-select').value;
    const accent = document.getElementById('pdf-accent-color').value;
    const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);

    // Show loading state or hide empty placeholder
    document.getElementById('pdf-preview-empty').style.display = 'none';
    const previewIframe = document.getElementById('pdf-preview-iframe');
    previewIframe.style.display = 'block';

    // Enable download button
    const downloadBtn = document.getElementById('download-pdf-btn');
    downloadBtn.style.opacity = '1';
    downloadBtn.style.pointerEvents = 'auto';

    // Prepare data (simplified for preview performance)
    let diariesHtml = '';
    for(const d of diaries.slice(-5)) { // Only show last 5 for preview speed
        diariesHtml += `
            <div class="diary-card" style="page-break-inside: avoid;">
                <div class="card-header">
                    <span class="route">${escapeHTML(d.start)} &rarr; ${escapeHTML(d.end)}</span>
                </div>
                <div class="card-body">
                    <div class="info-row"><span class="label">📍 Coords:</span> <span class="mono">${d.coords || '---'}</span></div>
                    <div class="rating">${'★'.repeat(d.rating)}${'☆'.repeat(5-d.rating)}</div>
                </div>
            </div>
        `;
    }

    const htmlContent = generatePdfHtml(trip, font, accent, totalSpent, diariesHtml, true);

    const previewDoc = previewIframe.contentWindow.document;
    previewDoc.open();
    previewDoc.write(htmlContent);
    previewDoc.close();
}

function generatePdfHtml(trip, font, accent, totalSpent, diariesHtml, isPreview = false) {
    // Template specific CSS (moved from generateCustomPdf)
    let templateStyles = '';
    if (selectedTemplate === 'modern') {
        templateStyles = `
            body { background: #f4f7f6; }
            .container { max-width: 800px; margin: auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
            .report-header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid ${accent}; padding-bottom: 20px; }
            .diary-card { border: 1px solid #eee; border-radius: 12px; margin-bottom: 25px; overflow: hidden; }
            .card-header { background: ${accent}; color: white; padding: 15px 20px; display: flex; justify-content: space-between; }
        `;
    } else if (selectedTemplate === 'minimalist') {
        templateStyles = `
            body { background: white; color: #333; }
            .container { max-width: 700px; margin: auto; padding: 50px 0; }
            .report-header { border-left: 10px solid ${accent}; padding-left: 20px; margin-bottom: 50px; }
            .diary-card { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .card-header { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; border-bottom: none; color: ${accent}; }
        `;
    } else if (selectedTemplate === 'dark-lux') {
        templateStyles = `
            body { background: #1a1a1a; color: #eee; }
            .container { max-width: 850px; margin: 40px auto; background: #2d2d2d; padding: 50px; border-radius: 20px; border: 1px solid ${accent}; }
            .report-header { text-align: center; color: ${accent}; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 60px; }
            .diary-card { background: #3d3d3d; border-radius: 15px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.05); }
            .card-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px; }
        `;
    } else if (selectedTemplate === 'adventure') {
        templateStyles = `
            body { background: #fdf6e3; background-image: radial-gradient(#d3af37 0.5px, transparent 0.5px); background-size: 20px 20px; }
            .container { max-width: 800px; margin: 30px auto; background: #fff; padding: 40px; border: 2px solid #5d4037; border-radius: 5px; }
            .report-header { background: #5d4037; color: #fff; padding: 20px; transform: rotate(-1deg); margin-bottom: 40px; }
            .diary-card { border: 2px dashed #8d6e63; margin-bottom: 30px; padding: 15px; background: #fffaf0; }
        `;
    } else if (selectedTemplate === 'magazine') {
        templateStyles = `
            body { background: #eee; }
            .container { max-width: 900px; margin: auto; background: white; display: grid; grid-template-columns: 1fr; }
            .report-header { padding: 80px 40px; background: #000; color: #fff; text-align: left; }
            .report-header h1 { font-size: 4em; margin: 0; line-height: 1; }
            .diary-card { display: grid; grid-template-columns: ${isPreview ? '1fr' : '1fr 1fr'}; gap: 30px; padding: 40px; border-bottom: 1px solid #000; }
        `;
    } else if (selectedTemplate === 'scrapbook') {
        templateStyles = `
            body { background: #d7ccc8; }
            .container { max-width: 800px; margin: 20px auto; padding: 40px; background: #fff; box-shadow: 5px 5px 15px rgba(0,0,0,0.2); position: relative; }
            .diary-card { transform: rotate(${isPreview ? 0 : (Math.random() * 4 - 2)}deg); background: #fff; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 40px; border: 1px solid #ddd; }
            .diary-card::before { content: ""; position: absolute; top: -10px; left: 50%; width: 100px; height: 30px; background: rgba(255,255,255,0.5); transform: translateX(-50%); }
        `;
    } else if (selectedTemplate === 'business') {
        templateStyles = `
            body { background: white; font-family: sans-serif; }
            .container { max-width: 1000px; margin: auto; padding: 40px; }
            .report-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .diary-card { margin-top: 30px; }
            .card-header { background: #f5f5f5; padding: 10px; border-bottom: 1px solid #333; }
            .info-row { display: grid; grid-template-columns: 150px 1fr; border-bottom: 1px solid #eee; padding: 8px 0; }
        `;
    } else if (selectedTemplate === 'nature') {
        templateStyles = `
            body { background: #e8f5e9; }
            .container { max-width: 800px; margin: auto; background: white; border-radius: 30px; padding: 50px; }
            .report-header { color: #2e7d32; text-align: center; }
            .diary-card { border: 2px solid #a5d6a7; border-radius: 20px; margin-bottom: 30px; padding: 20px; }
            .rating { color: #2e7d32; }
        `;
    } else if (selectedTemplate === 'vintage') {
        templateStyles = `
            body { background: #3e2723; }
            .container { max-width: 800px; margin: auto; background: #efebe9; color: #4e342e; padding: 60px; font-family: serif; }
            .report-header { border-bottom: 1px solid #4e342e; padding-bottom: 20px; text-align: center; font-style: italic; }
            .diary-card { border: 1px solid #bcaaa4; padding: 20px; margin-bottom: 30px; }
        `;
    } else if (selectedTemplate === 'colorful') {
        templateStyles = `
            body { background: ${accent}; }
            .container { max-width: 800px; margin: 40px auto; background: white; border-radius: 20px; padding: 40px; }
            .diary-card { background: #f3f4f6; border-radius: 15px; margin-bottom: 20px; border-left: 8px solid ${accent}; }
        `;
    } else if (selectedTemplate === 'skyline') {
        templateStyles = `
            body { background: #eceff1; }
            .container { max-width: 800px; margin: auto; background: white; position: relative; overflow: hidden; padding: 40px; }
            .container::after { content: "CITY"; position: absolute; bottom: -50px; right: -50px; font-size: 300px; color: rgba(0,0,0,0.03); font-weight: 900; z-index: 0; }
            .diary-card { position: relative; z-index: 1; backdrop-filter: blur(5px); background: rgba(255,255,255,0.8); }
        `;
    } else if (selectedTemplate === 'polaroid') {
        templateStyles = `
            .diary-card { background: white; padding: 15px 15px 60px 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); margin-bottom: 50px; }
            .diary-photos img { width: 100%; height: auto; border: 1px solid #eee; }
            .card-header { padding: 20px 0; font-family: cursive; font-size: 1.5em; text-align: center; }
        `;
    } else if (selectedTemplate === 'timeline') {
        templateStyles = `
            .container { position: relative; padding-left: 50px; border-left: 4px solid ${accent}; margin-left: ${isPreview ? '10px' : '100px'}; }
            .diary-card { position: relative; margin-bottom: 60px; }
            .diary-card::before { content: ""; position: absolute; left: -67px; top: 20px; width: 30px; height: 30px; background: ${accent}; border-radius: 50%; border: 5px solid white; }
        `;
    } else if (selectedTemplate === 'map-focus') {
        templateStyles = `
            .container { max-width: 900px; margin: auto; }
            .diary-card { display: flex; flex-direction: ${isPreview ? 'column' : 'row'}; gap: 30px; align-items: center; border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; }
            .mono { background: #000; color: #0f0; padding: 2px 5px; border-radius: 3px; }
        `;
    } else if (selectedTemplate === 'classic') {
        templateStyles = `
            body { font-family: "Times New Roman", serif; padding: 50px; }
            .report-header { border-bottom: 3px double #000; padding: 20px; text-align: center; }
            .diary-card { margin-top: 40px; page-break-inside: avoid; }
        `;
    }

    return `
        <html>
        <head>
            <title>Trip Report: ${escapeHTML(trip.name)}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,700&family=JetBrains+Mono:wght@700&family=Dancing+Script:wght@700&family=Montserrat:wght@400;700&family=Roboto:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Oswald:wght@400;700&family=Quicksand:wght@400;700&family=Caveat:wght@400;700&family=Abril+Fatface&family=Raleway:wght@400;700&family=Comfortaa:wght@400;700&family=Cinzel:wght@400;700&family=Exo+2:wght@400;700&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: ${isPreview ? '0' : '20px'}; font-family: ${font}; line-height: 1.6; font-size: ${isPreview ? '10px' : '16px'}; width: ${isPreview ? '100%' : 'auto'}; overflow-x: hidden; }
                .container { position: relative; z-index: 1; width: 100%; max-width: 800px; margin: auto; }
                .report-header h1 { margin: 0; font-size: 2.5em; }
                .summary-box { background: rgba(0,0,0,0.03); padding: 20px; border-radius: 10px; margin-bottom: 40px; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; }
                .summary-item { text-align: center; }
                .summary-item .val { font-size: 1.5em; font-weight: bold; color: ${accent}; display: block; }
                .summary-item .lab { font-size: 0.8em; color: #666; text-transform: uppercase; }
                .diary-card { margin-bottom: 30px; }
                .card-body { padding: 20px; }
                .info-row { margin-bottom: 8px; }
                .label { font-weight: bold; margin-right: 10px; color: #555; }
                .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
                .rating { color: #f59e0b; font-size: 1.2em; margin: 10px 0; }
                .diary-photos { display: flex; gap: 10px; margin-top: 15px; overflow: hidden; flex-wrap: wrap; }
                .diary-photos img { max-height: 150px; border-radius: 8px; object-fit: cover; }
                .footer { margin-top: 80px; text-align: center; font-size: 0.8em; opacity: 0.5; padding: 40px 0; border-top: 1px solid #eee; }
                @media print {
                    body { padding: 0; font-size: 14px; }
                    .container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .diary-photos img { max-height: 250px; }
                }
                ${templateStyles}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="report-header">
                    <h1>${escapeHTML(trip.name)}</h1>
                    <p>${new Date(trip.startDate).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                </div>
                <div class="summary-box">
                    <div class="summary-item">
                        <span class="val">${diaries.length}</span>
                        <span class="lab">${currentLang === 'vi' ? 'Điểm đến' : 'Destinations'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="val">${totalSpent.toLocaleString()}đ</span>
                        <span class="lab">${currentLang === 'vi' ? 'Tổng chi' : 'Total Spent'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="val">${(totalDistance / 1000).toFixed(1)}km</span>
                        <span class="lab">${currentLang === 'vi' ? 'Quãng đường' : 'Distance'}</span>
                    </div>
                </div>
                <div class="diary-list">
                    ${diariesHtml}
                </div>
                <div class="footer">
                    <p>Powered By <strong>Nhutcoder</strong></p>
                </div>
            </div>
            ${isPreview ? '' : `
            <script>
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                };
            </script>
            `}
        </body>
        </html>
    `;
}

async function generateCustomPdf() {
    const trip = getCurrentTrip();
    if (!trip) return;

    const font = document.getElementById('pdf-font-select').value;
    const accent = document.getElementById('pdf-accent-color').value;
    const totalSpent = spendings.reduce((sum, s) => sum + s.amount, 0);

    // Prepare full data
    let diariesHtml = '';
    for(const d of diaries) {
        let photosHtml = '';
        if (d.hasPhotos) {
            const photos = await getPhotos(d.id);
            photosHtml = `<div class="diary-photos">
                ${photos.map(p => `<img src="${p}">`).join('')}
            </div>`;
        }

        diariesHtml += `
            <div class="diary-card">
                <div class="card-header">
                    <span class="route">${escapeHTML(d.start)} &rarr; ${escapeHTML(d.end)}</span>
                    <span class="time">${new Date(d.time).toLocaleString(currentLang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                </div>
                <div class="card-body">
                    <div class="info-row"><span class="label">🍴 Món ăn:</span> <span>${escapeHTML(d.food) || '---'}</span></div>
                    <div class="info-row"><span class="label">💰 Chi phí:</span> <span>${Number(d.cost).toLocaleString()}đ</span></div>
                    <div class="info-row"><span class="label">📍 Tọa độ:</span> <span class="mono">${d.coords || '---'}</span></div>
                    <div class="rating">${'★'.repeat(d.rating)}${'☆'.repeat(5-d.rating)}</div>
                    ${photosHtml}
                </div>
            </div>
        `;
    }

    const htmlContent = generatePdfHtml(trip, font, accent, totalSpent, diariesHtml, false);

    // Create a hidden iframe for more reliable PDF generation
    let iframe = document.getElementById('pdf-export-iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'pdf-export-iframe';
        iframe.style.position = 'fixed'; iframe.style.top = '-10000px';
        document.body.appendChild(iframe);
    }

    const reportDoc = iframe.contentWindow.document;
    reportDoc.open();
    reportDoc.write(htmlContent);
    reportDoc.close();

    // Trigger print from iframe
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 1500);

    closePdfModal();
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
                fillColor: '#795548', // Brown check-in marker as requested
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
    updatePipStatus();

    // Use current location if available
    if (currentLocation) {
        markers.current = L.circleMarker(currentLocation, {
            radius: 10, fillColor: '#6366f1', color: '#fff', weight: 3, fillOpacity: 1
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

function updatePipStatus() {
    const btn = document.getElementById('pip-btn');
    if (!btn) return;
    if (document.pictureInPictureElement) {
        btn.classList.add('active-pip');
        btn.querySelector('span').innerText = currentLang === 'vi' ? 'Đang bật cửa sổ nổi' : 'Floating window active';
    } else {
        btn.classList.remove('active-pip');
        btn.querySelector('span').innerText = translations[currentLang].pip_btn;
    }
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
            updatePipStatus();
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
    ctx.fillStyle = '#10b981'; // Success Green
    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentKmh, 150, 120);
    ctx.font = '20px monospace';
    ctx.fillText('km/h', 150, 150);

    // Simplified Map info
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    if (currentLocation) {
        ctx.fillText(`KM: ${(totalDistance/1000).toFixed(2)} | GPS: ${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}`, 150, 190);
    }

    // Draw a small circle for current position relative to Start/Dest
    const trip = getCurrentTrip();
    if (trip && trip.markers && trip.markers.start && trip.markers.dest) {
         ctx.strokeStyle = '#6366f1'; // Primary
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.moveTo(50, 240);
         ctx.lineTo(250, 240);
         ctx.stroke();

         // Start marker
         ctx.fillStyle = '#10b981'; // Success
         ctx.beginPath(); ctx.arc(50, 240, 5, 0, Math.PI*2); ctx.fill();

         // Dest marker
         ctx.fillStyle = '#3b82f6'; // Blue
         ctx.beginPath(); ctx.arc(250, 240, 5, 0, Math.PI*2); ctx.fill();

         // Current Position estimate (linear approximation)
         ctx.fillStyle = '#ef4444'; // Danger
         // Rough percentage calculation
         ctx.beginPath(); ctx.arc(150, 240, 7, 0, Math.PI*2); ctx.fill();
    }
}

function startPipRendering() {
    if (pipInterval) clearInterval(pipInterval);

    // Also listen for manual exit (via system UI)
    const video = document.getElementById('pip-video');
    video.onleavepictureinpicture = () => {
        updatePipStatus();
        if (timerWorker) {
            timerWorker.postMessage('stop');
            timerWorker.terminate();
            timerWorker = null;
        }
    };

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
        ], { color: primaryColor, weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }
    if (savedMarkers.dest && savedMarkers.return) {
        polylines.toReturn = L.polyline([
            [savedMarkers.dest.lat, savedMarkers.dest.lng],
            [savedMarkers.return.lat, savedMarkers.return.lng]
        ], { color: '#ef4444', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }
}
