import { getFirebaseWebConfig } from "@/lib/fcm";

export async function GET() {
  const cfg = getFirebaseWebConfig();
  const firebaseConfig = cfg.configured
    ? {
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        projectId: cfg.projectId,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId,
      }
    : {};

  const script = `importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(firebaseConfig)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  var title = (payload.notification && payload.notification.title) || "UjuziLab";
  var options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: "/favicon.ico",
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url;
  if (url) event.waitUntil(clients.openWindow(url));
});
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache",
    },
  });
}
