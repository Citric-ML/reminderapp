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
  console.log("SW received message:", event.data);

  const data = event.data || {};

  // ======================
  // DEBUG NOTIFICATION
  // ======================
  if (data.type === "DEBUG_NOTIFY") {
    event.waitUntil(
      self.registration.showNotification("Pallas Debug :3", {
        body: "This is a test notification.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "debug-test"
      })
    );
    return;
  }

  // ======================
  // REMINDER CHECKING
  // ======================
  if (data.type !== "CHECK_REMINDERS" || !Array.isArray(data.reminders)) return;

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  data.reminders.forEach(reminder => {
    const key = `${reminder.id}-${todayISO}`;

    if (firedToday.has(key)) return;
    if (Notification.permission !== "granted") return;

    const [h, m] = reminder.time.split(":").map(Number);
    const fireTime = new Date();
    fireTime.setHours(h, m, 0, 0);

    if (now >= fireTime) {
      event.waitUntil(
        self.registration.showNotification("Pallas Reminder", {
          body: reminder.text,
          tag: key,
          renotify: false,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png"
        })
      );

      firedToday.add(key);
    }
  });
});

