// service-worker.js

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  self.clients.claim();
});

// Track which reminders fired today (resets when SW restarts)
const firedToday = new Set();

self.addEventListener("message", event => {
  const { type, reminders } = event.data || {};

  if (type !== "CHECK_REMINDERS" || !Array.isArray(reminders)) return;

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  reminders.forEach(reminder => {
    const key = `${reminder.id}-${todayISO}`;

    if (firedToday.has(key)) return;
    if (Notification.permission !== "granted") return;

    const [h, m] = reminder.time.split(":").map(Number);
    const fireTime = new Date();
    fireTime.setHours(h, m, 0, 0);

    // Fire only if current time has passed reminder time
    if (now >= fireTime) {
      event.waitUntil(
        self.registration.showNotification("Pallas Reminder", {
          body: reminder.text,
          tag: key,              // prevents OS-level duplicates
          renotify: false,
          badge: "/icons/icon-192.png",
          icon: "/icons/icon-192.png"
        });
      );

      firedToday.add(key);
    }
  });
});

//----------DEBUG----------------
self.addEventListener("message", event => {
  const data = event.data || {};

  //DEBUG NOTIFICATION
  if (data.type === "DEBUG_NOTIFY") {
    if (Notification.permission !== "granted") return;

    event.waitUntil(
      self.registration.showNotification("Pallas Debug :3", {
        body: "If you see this, notifications are working!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "debug-notification"
      })
    );
    return;
  }

  // Existing reminder logic
  const { type, reminders } = data;
  if (type !== "CHECK_REMINDERS" || !Array.isArray(reminders)) return;

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  reminders.forEach(reminder => {
    const key = `${reminder.id}-${todayISO}`;
    if (firedToday.has(key)) return;

    const [h, m] = reminder.time.split(":").map(Number);
    const fireTime = new Date();
    fireTime.setHours(h, m, 0, 0);

    if (now >= fireTime && Notification.permission === "granted") {
      event.waitUntil(
        self.registration.showNotification("Pallas Reminder", {
          body: reminder.text,
          tag: key,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png"
        })
      );
      firedToday.add(key);
    }
  });
});
