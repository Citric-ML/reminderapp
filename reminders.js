//-----------------------------------------
// Reading and writing data to local storage
//-----------------------------------------

let currentEditId = null; // added

function read() {
  return JSON.parse(localStorage.getItem("database")) || [];
}

function readLast() {
  const database = read();
  if (database.length === 0) return null;
  return database[database.length - 1];
}

function addOrUpdateReminder(reminderData) {
  const database = read();

  if (currentEditId) {
    const index = database.findIndex(r => r.id === currentEditId);
    if (index !== -1) {
      database[index].text = reminderData.text;
      database[index].time = reminderData.time;
    }
    currentEditId = null;
  } else {
    const nextId = database.length === 0
      ? 1
      : database[database.length - 1].id + 1;

    database.push({
      id: nextId,
      time: reminderData.time,
      text: reminderData.text,
      createdAt: new Date().toISOString()
    });
  }

  localStorage.setItem("database", JSON.stringify(database));
}

// ---------- Templates ----------
const DEFAULT_TEMPLATES = [
  "Complete [] flashcards on []",
  "Write [] words for the [] essay",
  "Review notes for []",
  "Practice [] for [] minutes",
  "Prepare materials for []"
];

function readTemplates() {
  const saved = JSON.parse(localStorage.getItem("templates"));
  return saved && Array.isArray(saved)
    ? [...DEFAULT_TEMPLATES, ...saved]
    : [...DEFAULT_TEMPLATES];
}

function saveTemplate(newTemplate) {
  const saved = JSON.parse(localStorage.getItem("templates")) || [];

  if (saved.includes(newTemplate)) return; // prevent duplicates

  saved.push(newTemplate);
  localStorage.setItem("templates", JSON.stringify(saved));
}

// ---------- UI Wiring ----------
document.addEventListener("DOMContentLoaded", () => {
  const reminderInput = document.getElementById("reminderInput");
  const timeInput = document.getElementById("timeInput");
  const submitButton = document.getElementById("submitReminder");
  const fetchButton = document.getElementById("fetchLastReminder");
  const output = document.getElementById("output");
  const suggestionsBox = document.getElementById("templateSuggestions");

  // Submit button
  submitButton.addEventListener("click", () => {
    const text = reminderInput.value.trim();
    const time = timeInput.value;

    if (text === "" || time === "") {
      output.textContent = "Please enter both a reminder and a time.";
      return;
    }

    addOrUpdateReminder({ time, text });

    reminderInput.value = "";
    timeInput.value = "";
    currentEditId = null;

    renderReminders();
    output.textContent = "Reminder saved.";
  });

  // Fetch button
  fetchButton.addEventListener("click", () => {
    const lastReminder = readLast();
    if (!lastReminder) {
      output.textContent = "No reminders found.";
      return;
    }
    output.textContent = JSON.stringify(lastReminder, null, 2);
  });

  // Templates
  function showTemplates() {
    suggestionsBox.innerHTML = "";
  
    const templates = readTemplates();
  
    templates.forEach(template => {
      const item = document.createElement("div");
      item.textContent = template;
  
      item.addEventListener("click", () => {
        reminderInput.value = template;
        suggestionsBox.classList.add("hidden");
        reminderInput.focus();
      });
  
      suggestionsBox.appendChild(item);
    });
  
    suggestionsBox.classList.remove("hidden");
  }


  reminderInput.addEventListener("focus", () => {
    showTemplates();
  });

  document.addEventListener("click", (event) => {
    if (
      !reminderInput.contains(event.target) &&
      !suggestionsBox.contains(event.target)
    ) {
      suggestionsBox.classList.add("hidden");
    }
  });
  
  const setNewTemplateButton = document.getElementById("setNewTemplate");

  setNewTemplateButton.addEventListener("click", () => {
    const text = reminderInput.value.trim();
  
    if (text === "") {
      output.textContent = "Cannot save an empty template.";
      return;
    }
  
    saveTemplate(text);
    output.textContent = "Template saved.";
  
    showTemplates(); // refresh dropdown immediately
  });


  // Reminder rendering
  function renderReminders() {
    const listContainer = document.getElementById("reminderList");
    listContainer.innerHTML = "";

    const reminders = read().sort((a, b) => a.time.localeCompare(b.time));

    reminders.forEach(r => {
      const item = document.createElement("div");
      item.className = "reminder-item";
      item.textContent = `${r.time} — ${r.text}`;

      // Click to edit
      item.addEventListener("click", () => {
        reminderInput.value = r.text;
        timeInput.value = r.time;
        currentEditId = r.id;
      });

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteReminder(r.id);
      });

      item.appendChild(deleteBtn);
      listContainer.appendChild(item);
    });
  }

  function deleteReminder(id) {
    const database = read().filter(r => r.id !== id);
    localStorage.setItem("database", JSON.stringify(database));
    renderReminders();
  }

  // Initial render
  renderReminders();
});
