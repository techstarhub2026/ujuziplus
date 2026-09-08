/* UjuziLab — Web Push service worker */
self.addEventListener("push", (event) => {
  let data = { title: "UjuziLab", body: "You have a new notification", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
