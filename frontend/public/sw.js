self.addEventListener("push", (event) => {
  const data = event.data.json();
  const { title, body } = data;

  const options = {
    body: body,
    icon: "./images/TimerLogo.png",
    vibrate: [200, 100, 200],
    data: { url: "/profile" },
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      console.log("Sending sound message to clients"); // Debugging line
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "PLAY_SOUND", url: "/sounds/notify.wav" })
        );
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
