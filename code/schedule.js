//THIS FILE STILL HAS ISSUES! FIX LATER!

//Storage functions
function readBlocks() {
  return JSON.parse(localStorage.getItem("blocks")) || [];
}

function saveBlocks(blocks) {
  localStorage.setItem("blocks", JSON.stringify(blocks));
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const startHour = 8;  // 8 AM
const totalHours = 12;

const grid = document.getElementById("calendarGrid");
const debugOutput = document.getElementById("debugOutput");

// ---- Header Row ----
grid.appendChild(document.createElement("div")); // empty corner

days.forEach(day => {
  const header = document.createElement("div");
  header.className = "calendar-header";
  header.textContent = day;
  grid.appendChild(header);
});

// ---- Time Rows ----
for (let hour = 0; hour < totalHours; hour++) {
  const timeLabel = document.createElement("div");
  timeLabel.className = "time-label";
  timeLabel.textContent = formatHour(startHour + hour);
  grid.appendChild(timeLabel);

  days.forEach((day, dayIndex) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    cell.dataset.day = day;
    cell.dataset.hour = startHour + hour;
    cell.addEventListener("click", () => {
      selectedCell = cell;
      openBlockModal();
      /*if (!name) return;
    
      const startHour = startHourFromCell(cell);
      const endHour = startHour + 1;
    
      const block = {
        id: Date.now(), // simple unique ID
        day: cell.dataset.day,
        start: formatHour(startHour),
        end: formatHour(endHour),
        name: name,
        goals: "UNSET"
      };
    
      const blocks = readBlocks();
      blocks.push(block);
      saveBlocks(blocks);
    
      renderBlocks();*/
    });

    grid.appendChild(cell);
  });
}

// ---- Helpers ----
function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const formatted = hour > 12 ? hour - 12 : hour;
  return `${formatted}:00 ${suffix}`;
}

function startHourFromCell(cell) {
  return parseInt(cell.dataset.hour, 10);
}

function hourFromLabel(label) {
  const [time, period] = label.split(" ");
  let hour = parseInt(time.split(":")[0], 10);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour;
}
//------------------------------------------------------
//Calendar interactivity (set & render blocks)
//------------------------------------------------------
let selectedCell = null;

function openBlockModal() {
  const blockModal = document.getElementById("blockModal");
  const blockNameInput = document.getElementById("blockNameInput");

  blockNameInput.value = "";
  blockModal.classList.remove("hidden");
  blockNameInput.focus();
}

function closeBlockModal() {
  document.getElementById("blockModal").classList.add("hidden");
  selectedCell = null;
}
document.addEventListener("DOMContentLoaded", () => {
  const saveBlockBtn = document.getElementById("saveBlock");
  const cancelBlockBtn = document.getElementById("cancelBlock");
  const blockNameInput = document.getElementById("blockNameInput");

  saveBlockBtn.addEventListener("click", () => {
    if (!selectedCell) return;

    const name = blockNameInput.value.trim();
    if (!name) return;

    const startHour = parseInt(selectedCell.dataset.hour, 10);

    const block = {
      id: Date.now(),
      day: selectedCell.dataset.day,
      start: formatHour(startHour),
      end: formatHour(startHour + 1),
      name,
      goals: "UNSET"
    };

    const blocks = readBlocks();
    blocks.push(block);
    saveBlocks(blocks);

    renderBlocks();
    closeBlockModal();
  });

  cancelBlockBtn.addEventListener("click", closeBlockModal);
});

function renderBlocks() {
  // Clear existing blocks
  document.querySelectorAll(".calendar-block").forEach(b => b.remove());

  const blocks = readBlocks();

  blocks.forEach(block => {
    const cell = document.querySelector(
      `.calendar-cell[data-day="${block.day}"][data-hour="${hourFromLabel(block.start)}"]`
    );

    if (!cell) return;

    const blockDiv = document.createElement("div");
    blockDiv.className = "calendar-block";
    blockDiv.textContent = block.name;

    cell.appendChild(blockDiv);
  });
}
renderBlocks();
