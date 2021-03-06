var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
   'https://rafatutankamon.github.io/test_pwa/',
   'https://rafatutankamon.github.io/test_pwa/index.html',
   'https://rafatutankamon.github.io/test_pwa/scripts/app.js',
   'https://rafatutankamon.github.io/test_pwa/favicon.ico',
   'https://rafatutankamon.github.io/test_pwa/styles/inline.css',
   'https://rafatutankamon.github.io/test_pwa/images/clear.png',
   'https://rafatutankamon.github.io/test_pwa/images/cloudy-scattered-showers.png',
   'https://rafatutankamon.github.io/test_pwa/images/fog.png',
   'https://rafatutankamon.github.io/test_pwa/images/cloudy.png',
   'https://rafatutankamon.github.io/test_pwa/images/ic_refresh_white_24px.svg',
   'https://rafatutankamon.github.io/test_pwa/images/ic_add_white_24px.svg',
   'https://rafatutankamon.github.io/test_pwa/images/partly-cloudy.png',
   'https://rafatutankamon.github.io/test_pwa/images/rain.png',
   'https://rafatutankamon.github.io/test_pwa/images/scattered-showers.png',
   'https://rafatutankamon.github.io/test_pwa/images/sleet.png',
   'https://rafatutankamon.github.io/test_pwa/images/snow.png',
   'https://rafatutankamon.github.io/test_pwa/images/thunderstorm.png',
   'https://rafatutankamon.github.io/test_pwa/images/wind.png'
 ];


self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
   console.log('[ServiceWorker] Activate');
   e.waitUntil(
     caches.keys().then(function(keyList) {
       return Promise.all(keyList.map(function(key) {
         if (key !== cacheName && key !== dataCacheName) {
           console.log('[ServiceWorker] Removing old cache', key);
           return caches.delete(key);
         }
       }));
     })
   );
   return self.clients.claim();
 });

 self.addEventListener('clear', function(event) {
   event.waitUntil(
     caches.keys().then(function(cacheNames) {
       return Promise.all(
         cacheNames.filter(function(cacheName) {
           // Return true if you want to remove this cache,
           // but remember that caches are shared across
           // the whole origin
         }).map(function(cacheName) {
           return caches.delete(cacheName);
         })
       );
     })
   );
 });

 self.addEventListener('fetch', function(e) {
   console.log('[Service Worker] Fetch', e.request.url);
   var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
   if (e.request.url.indexOf(dataUrl) > -1) {
     /*
      * When the request URL contains dataUrl, the app is asking for fresh
      * weather data. In this case, the service worker always goes to the
      * network and then caches the response. This is called the "Cache then
      * network" strategy:
      * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
      */
     e.respondWith(
       caches.open(dataCacheName).then(function(cache) {
         return fetch(e.request).then(function(response){
           cache.put(e.request.url, response.clone());
           return response;
         });
       })
     );
   } else {
     /*
      * The app is asking for app shell files. In this scenario the app uses the
      * "Cache, falling back to the network" offline strategy:
      * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
      */
     e.respondWith(
       caches.match(e.request).then(function(response) {
         return response || fetch(e.request);
       })
     );
   }
 });