importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// We need to fetch the config from the server or hardcode it.
// Since this is a service worker, we can't easily import from ../firebase-applet-config.json
// But we can listen for a message from the client to initialize it.

let messaging;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    firebase.initializeApp(event.data.config);
    messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});
