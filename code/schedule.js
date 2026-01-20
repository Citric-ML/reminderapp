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
const CELL_HEIGHT = 48; //match CSS

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
      const blocks = readBlocks();
    
      const startHour = parseInt(cell.dataset.hour, 10);
      const day = cell.dataset.day;
    
      // Prevent duplicate block
      const exists = blocks.some(
        b => b.day === day && hourFromLabel(b.start) === startHour
      );
      if (exists) return;
    
      const block = {
        id: Date.now(),
        day,
        start: formatHour(startHour),
        duration: 1,
        name: "",
      };
    
      blocks.push(block);
      saveBlocks(blocks);
      renderBlocks();
    
      // Auto-edit newly created block
      const newBlock = cell.querySelector(".calendar-block");
      if (newBlock) enableInlineEdit(newBlock);
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
function deleteBlock(blockDiv) {
  const id = Number(blockDiv.dataset.id);
  const blocks = readBlocks();

  const updatedBlocks = blocks.filter(b => b.id !== id);
  saveBlocks(updatedBlocks);

  blockDiv.remove();
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function deleteOverlappingBlocks(target) {
  const blocks = readBlocks();
  const start = hourFromLabel(target.start);
  const end = start + target.duration;

  const filtered = blocks.filter(b => {
    if (b.id === target.id) return true;
    if (b.day !== target.day) return true;

    const bStart = hourFromLabel(b.start);
    const bEnd = bStart + (b.duration || 1);

    return bEnd <= start || bStart >= end;
  });

  saveBlocks(filtered);
}


//------------------------------------------------------
//Calendar interactivity (set & render blocks)
//------------------------------------------------------

function enableInlineEdit(blockDiv) {
  if (blockDiv.isEditing) return;
  blockDiv.isEditing = true;

  const blocks = readBlocks();
  const id = Number(blockDiv.dataset.id);
  const block = blocks.find(b => b.id === id);
  if (!block) return;

  blockDiv.textContent = "";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = block.name;
  nameInput.placeholder = "Block name";

  const durationInput = document.createElement("input");
  durationInput.type = "number";
  durationInput.min = 1;

  const startHour = hourFromLabel(block.start);
  const maxDuration = 19 - startHour; // up to 7 PM
  durationInput.max = maxDuration;
  durationInput.value = block.duration || 1;

  nameInput.style.marginBottom = "4px";

  blockDiv.appendChild(nameInput);
  blockDiv.appendChild(durationInput);

  nameInput.focus();

  function save() {
    block.name = nameInput.value.trim() || block.name;
    block.duration = clamp(
      parseInt(durationInput.value, 10) || 1,
      1,
      maxDuration
    );

    deleteOverlappingBlocks(block);
    saveBlocks(blocks);
    blockDiv.isEditing = false;
    renderBlocks();
  }

  nameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") durationInput.focus();
  });

  durationInput.addEventListener("keydown", e => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") renderBlocks();
  });

  nameInput.addEventListener("blur", () => setTimeout(save, 100));
}

function renderBlocks() {
  document.querySelectorAll(".calendar-block").forEach(b => b.remove());

  const blocks = readBlocks();

  blocks.forEach(block => {
    const startHour = hourFromLabel(block.start);

    const cell = document.querySelector(
      `.calendar-cell[data-day="${block.day}"][data-hour="${startHour}"]`
    );
    if (!cell) return;

    const blockDiv = document.createElement("div");
    blockDiv.className = "calendar-block";
    blockDiv.dataset.id = block.id;

    blockDiv.style.position = "absolute";
    blockDiv.style.top = "0";
    blockDiv.style.left = "0";
    blockDiv.style.height = `${block.duration * CELL_HEIGHT}px`;

    blockDiv.textContent = block.name;

    blockDiv.addEventListener("click", e => {
      e.stopPropagation();
      enableInlineEdit(blockDiv);
    });

    cell.appendChild(blockDiv);
  });
}

renderBlocks();
