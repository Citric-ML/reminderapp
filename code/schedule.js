// -------
// Storage
// -------
function readBlocks() {
  return JSON.parse(localStorage.getItem("blocks")) || [];
}

function saveBlocks(blocks) {
  localStorage.setItem("blocks", JSON.stringify(blocks));
}

// ---------
// Constants
// ---------
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const startHour = 8;
const totalHours = 12;
const CELL_HEIGHT = 48;

const grid = document.getElementById("calendarGrid");

// Form elements
const form = document.getElementById("blockForm");
const nameInput = document.getElementById("blockName");
const startInput = document.getElementById("blockStart");
const endInput = document.getElementById("blockEnd");
const createBtn = document.getElementById("createBlockBtn");

let pendingCell = null;

// ---------------
// Grid generation
// ---------------
grid.appendChild(document.createElement("div"));

days.forEach(day => {
  const header = document.createElement("div");
  header.className = "calendar-header";
  header.textContent = day;
  grid.appendChild(header);
});

for (let hour = 0; hour < totalHours; hour++) {
  const label = document.createElement("div");
  label.className = "time-label";
  label.textContent = formatHour(startHour + hour);
  grid.appendChild(label);

  days.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.dataset.day = day;
    cell.dataset.hour = startHour + hour;
    grid.appendChild(cell);
  });
}

// ----------------
// Event delegation
// ----------------
grid.addEventListener("click", e => {
  const cell = e.target.closest(".calendar-cell");
  if (!cell) return;

  const day = cell.dataset.day;
  const hour = Number(cell.dataset.hour);

  const blocks = readBlocks();
  const existing = blocks.find(
    b => b.day === day && b.startHour === hour
  );
  //handles cell creation/deletion
  if (existing) {
    saveBlocks(blocks.filter(b => b.id !== existing.id));
    renderBlocks();
    return;
  }
  pendingCell = { day, hour };
  openForm(hour);
});

// ----------
// Form logic
// ----------
function openForm(hour) {
  form.classList.remove("hidden");

  nameInput.value = "";
  startInput.value = `${String(hour).padStart(2, "0")}:00`;
  endInput.value = `${String(hour + 1).padStart(2, "0")}:00`;

  nameInput.focus();
}

createBtn.addEventListener("click", () => {
  if (!pendingCell) return;

  const blocks = readBlocks();

  const startHour = parseInt(startInput.value.split(":")[0], 10);
  const endHour = parseInt(endInput.value.split(":")[0], 10);
  const duration = Math.max(1, endHour - startHour);

  blocks.push({
    id: Date.now(),
    day: pendingCell.day,
    startHour,
    duration,
    name: nameInput.value.trim() || "Untitled",
  });

  saveBlocks(blocks);
  pendingCell = null;
  form.classList.add("hidden");
  renderBlocks();
});

// ---------
// Rendering
// ---------
function renderBlocks() {
  document.querySelectorAll(".calendar-block").forEach(b => b.remove());

  const blocks = readBlocks();

  blocks.forEach(block => {
    const cell = document.querySelector(
      `.calendar-cell[data-day="${block.day}"][data-hour="${block.startHour}"]`
    );
    if (!cell) return;

    const div = document.createElement("div");
    div.className = "calendar-block";
    div.style.height = `${block.duration * CELL_HEIGHT}px`;
    div.textContent = block.name;

    cell.appendChild(div);
  });
}

// -----------------
// Helper (only one)
// -----------------
function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${suffix}`;
}

renderBlocks();
