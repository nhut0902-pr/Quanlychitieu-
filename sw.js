const CACHE_NAME = 'travel-diary-v19';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './games.js',
  './webrtc.js',
  'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://img.icons8.com/color/192/000000/map-marker.png',
  'https://img.icons8.com/color/512/000000/map-marker.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&family=Playfair+Display:ital,wght@0,700;1,700&family=Dancing+Script:wght@700&family=Montserrat:wght@400;700&family=Roboto:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Oswald:wght@400;700&family=Quicksand:wght@400;700&family=Caveat:wght@400;700&family=Abril+Fatface&family=Raleway:wght@400;700&family=Comfortaa:wght@400;700&family=Cinzel:wght@400;700&family=Exo+2:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});
