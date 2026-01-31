//---Utilities---
const LAST_ACTIVE_KEY = "lastActiveDate";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function checkForNewDay() {
  const today = todayISO();
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);

  if (lastActive !== today) {
    // New day detected
    localStorage.setItem(LAST_ACTIVE_KEY, today);
    return true;
  }

  return false;
}



// -----------------
// Storage functions
// -----------------
function readHabits() {
  return JSON.parse(localStorage.getItem("habits")) || [];
}

function saveHabits(habits) {
  localStorage.setItem("habits", JSON.stringify(habits));
}

// ---------
// Constants
// ---------
const SUGGESTIONS = [
  "be kind", "stretch", "practice instrument", "meditate", "feed pet", "be coolio"
];

const today = () => new Date().toISOString().slice(0, 10);

// --------------
// Habit creation
// --------------
const form = document.getElementById("habitForm");
const input = document.getElementById("habitName");
const suggestionsDiv = document.getElementById("suggestions");

document.getElementById("createHabitBtn").onclick = () => {
  form.hidden = false;
  input.value = "";
};

SUGGESTIONS.forEach(name => {
  const btn = document.createElement("button");
  btn.textContent = name;
  btn.onclick = () => (input.value = name);
  suggestionsDiv.appendChild(btn);
});

document.getElementById("saveHabit").onclick = () => {
  if (!input.value.trim()) return;

  const habits = readHabits();
  habits.push({
    id: Date.now(),
    name: input.value.trim(),
    createdAt: today(),
    logs: {}
  });

  saveHabits(habits);
  form.hidden = true;
  render();
};

// -------------
// Daily tracker
// -------------
function renderDailyTracker() {
  const container = document.getElementById("dailyTracker");
  container.innerHTML = "";

  const habits = readHabits();
  const date = today();

  habits.forEach(habit => {
    const box = document.createElement("div");
    const done = habit.logs[date];

    box.textContent = habit.name + (done ? ` :D ${done}` : "");
    box.onclick = () => {
      if (habit.logs[date]) {
        delete habit.logs[date];
      } else {
        habit.logs[date] = currentTime();
      }
      saveHabits(habits);
      render();
    };

    container.appendChild(box);
  });
}
//gets rid of inactive habits, no delete button to incentivise continuing the habit
function pruneInactiveHabits(daysInactive = 7) {
  const habits = readHabits();
  const now = new Date();

  const cutoff = new Date();
  cutoff.setDate(now.getDate() - daysInactive);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const activeHabits = habits.filter(habit => {
    const logDates = Object.keys(habit.logs || {});

    // If it has logs, keep if any are recent
    if (logDates.length > 0) {
      return logDates.some(d => d >= cutoffISO);
    }

    // No logs yet → allow grace period from creation
    if (!habit.createdAt) return true; // backward compatibility

    return habit.createdAt >= cutoffISO;
  });

  if (activeHabits.length !== habits.length) {
    saveHabits(activeHabits);
  }
}



// -----
// Graph
// -----
function renderGraph() {
  const svg = document.getElementById("habitGraph");
  svg.innerHTML = "";

  const habits = readHabits();
  const days = lastNDays(28);
  const width = svg.viewBox.baseVal.width || svg.width.baseVal.value;
  const height = svg.viewBox.baseVal.height || svg.height.baseVal.value;

  habits.forEach((habit, i) => {
    const segments = [];
    let current = [];

    days.forEach((date, index) => {
      const time = habit.logs[date];
      if (!time) {
        if (current.length) segments.push(current);
        current = [];
        return;
      }

      const hour = timeToDecimal(time);
      current.push([
        (index / 27) * width,
        height - (hour / 24) * height
      ]);
    });

    if (current.length) segments.push(current);

    segments.forEach(seg => {
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute(
        "points",
        seg.map(p => p.join(",")).join(" ")
      );
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", colorFor(i));
      poly.setAttribute("stroke-width", "2");
      svg.appendChild(poly);
    });
  });
}
//------------
//Habit Ticker
//------------

function calculateStreak(maxDays = 100) {
  const habits = readHabits();
  if (habits.length === 0) return 0;

  let streak = 0;

  for (let i = 0; i < maxDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const iso = date.toISOString().slice(0, 10);

    const allDone = habits.every(habit => habit.logs[iso]);
    if (!allDone) break;

    streak++;
  }

  return streak;
}

function renderStreak() {
  const streak = Math.min(calculateStreak(), 99);
  const display = String(streak).padStart(2, "0");

  document.getElementById("streakCounter").textContent = display;
}

// -------
// Helpies
// -------
function lastNDays(n) {
  return [...Array(n)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function timeToDecimal(t) {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function currentTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function colorFor(i) {
  return `hsl(${(i * 67) % 360}, 70%, 50%)`;
}

// --------------------
function render() {
  pruneInactiveHabits(7);
  renderStreak()
  renderDailyTracker();
  renderGraph();
}
checkForNewDay();
render();
