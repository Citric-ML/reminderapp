// -----------------------------
// Service Worker + Notifications
// -----------------------------

let reminderIntervalStarted = false;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => {
      if (navigator.serviceWorker.controller) {
        startReminderLoop();
      } else {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          startReminderLoop();
        });
      }
    });
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function sendRemindersToServiceWorker() {
  if (!navigator.serviceWorker.controller) return;

  const reminders = JSON.parse(localStorage.getItem("database")) || [];

  navigator.serviceWorker.controller.postMessage({
    type: "CHECK_REMINDERS",
    reminders
  });
}

function startReminderLoop() {
  if (reminderIntervalStarted) return;
  reminderIntervalStarted = true;

  requestNotificationPermission().then(granted => {
    if (!granted) return;

    sendRemindersToServiceWorker();
    setInterval(sendRemindersToServiceWorker, 60 * 1000);
  });
}

//notifications button
document
  .getElementById("enableNotifications")
  .addEventListener("click", async () => {
    const granted = await Notification.requestPermission();
    console.log("Permission:", granted);
  });

//utilities
const todayISO = () => new Date().toISOString().slice(0, 10);
const todayDay = () =>
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

function el(tag, text) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  return e;
}
//----Load top 3 elements in each data section----
function loadHabitsPreview() {
  const container = document.getElementById("habits-output-area");
  container.innerHTML = "";

  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const today = todayISO();

  const pending = habits.filter(h => !h.logs[today]);

  pending.slice(0, 3).forEach(habit => {
    container.appendChild(el("div", habit.name));
  });

  if (pending.length > 3) {
    const more = el("a", "See all →");
    more.href = "habits.html";
    container.appendChild(more);
  }
}

function loadRemindersPreview() {
  const container = document.getElementById("reminder-output-area");
  container.innerHTML = "";

  const reminders = JSON.parse(localStorage.getItem("database")) || [];

  const sorted = reminders
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  sorted.slice(0, 3).forEach(r => {
    const div = document.createElement("div");
    div.textContent = `${r.time} — ${r.text}`;
    container.appendChild(div);
  });

  if (sorted.length > 3) {
    const more = document.createElement("a");
    more.textContent = "See all →";
    more.href = "reminders.html";
    container.appendChild(more);
  }
}


function loadSchedulePreview() {
  const container = document.getElementById("schedule-output-area");
  container.innerHTML = "";

  const blocks = JSON.parse(localStorage.getItem("blocks")) || [];
  const today = todayDay();

  const todays = blocks
    .filter(b => b.day === today)
    .sort((a, b) => a.startHour - b.startHour);

  todays.slice(0, 3).forEach(b => {
    container.appendChild(
      el("div", `${b.startHour}:00 — ${b.name}`)
    );
  });

  if (todays.length > 3) {
    const more = el("a", "See all →");
    more.href = "schedule.html";
    container.appendChild(more);
  }
}
//----Rendering data to homepage----
function renderHome() {
  loadHabitsPreview();
  loadRemindersPreview();
  loadSchedulePreview();
}

renderHome();
