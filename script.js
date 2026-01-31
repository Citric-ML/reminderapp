//utilities
const todayISO = () => new Date().toISOString().slice(0, 10);
const todayDay = () =>
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

function el(tag, text) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  return e;
}

//===Today page (pulls from localStorage)===
function getMinutesUntil(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const t = new Date();
  t.setHours(h, m, 0, 0);
  return Math.floor((t - now) / 60000);
}

function buildTodayFeed() {
  const feed = [];

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);
  const todayDay =
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];

  // ---------- Reminders ----------
  const reminders =
    JSON.parse(localStorage.getItem("database")) || [];

  reminders.forEach(r => {
    const mins = getMinutesUntil(r.time);
    if (mins >= -120) { // show recent + upcoming
      feed.push({
        type: "reminder",
        minutes: mins,
        label: r.text,
        time: r.time
      });
    }
  });

  // ---------- Habits (not completed today) ----------
  const habits =
    JSON.parse(localStorage.getItem("habits")) || [];

  habits.forEach(h => {
    if (!h.logs || !h.logs[todayISO]) {
      feed.push({
        type: "habit",
        minutes: 9999, // habits float lower
        label: h.name,
        time: "Any time today"
      });
    }
  });

  // ---------- Schedule blocks (today) ----------
  const blocks =
    JSON.parse(localStorage.getItem("blocks")) || [];

  blocks
    .filter(b => b.day === todayDay)
    .forEach(b => {
      const mins = (b.startHour * 60) - (now.getHours() * 60 + now.getMinutes());
      feed.push({
        type: "schedule",
        minutes: mins,
        label: b.name,
        time: `${b.startHour}:00`
      });
    });

  // ---------- Sort by urgency ----------
  feed.sort((a, b) => a.minutes - b.minutes);

  return feed.slice(0, 6); // keep it calm
}

function renderTodayFeed() {
  const container = document.getElementById("today-feed");
  container.innerHTML = "";

  const feed = buildTodayFeed();

  if (feed.length === 0) {
    container.textContent = "Nothing pressing right now.";
    return;
  }

  feed.forEach(item => {
    const el = document.createElement("div");
    el.className = `today-item ${item.type}`;

    const time =
      item.minutes < 0
        ? `${Math.abs(item.minutes)}m overdue`
        : item.minutes < 60
        ? `in ${item.minutes}m`
        : item.time;

    el.innerHTML = `
      <div class="today-label">${item.label}</div>
      <div class="today-time">${time}</div>
    `;

    container.appendChild(el);
  });
}


//----Rendering data to homepage----
function renderHome() {
  renderTodayFeed();
}

renderHome();
