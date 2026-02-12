const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  const totalEl = document.getElementById("totalCount");
  const activeEl = document.getElementById("activeCount");
  const completedEl = document.getElementById("completedCount");

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (completedEl) completedEl.textContent = completed;
}

function renderTasks() {
  list.innerHTML = "";
  updateStats();

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    // Toggle complete when clicking the text
    span.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // Actions container (edit + delete)
    const actions = document.createElement("div");
    actions.classList.add("actions");

    // Edit button (pencil)
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.classList.add("icon-btn");
    editBtn.textContent = "✎";

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.value = task.text;
      inputEl.classList.add("edit-input");

      // swap span -> input
      li.replaceChild(inputEl, span);
      inputEl.focus();
      inputEl.select();

      function saveEdit() {
        const newText = inputEl.value.trim();
        if (newText) task.text = newText;
        saveTasks();
        renderTasks();
      }

      inputEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") saveEdit();
        if (ev.key === "Escape") renderTasks(); // cancel
      });

      inputEl.addEventListener("blur", saveEdit);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.classList.add("icon-btn", "danger");
    deleteBtn.textContent = "✕";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  input.value = "";
  saveTasks();
  renderTasks();
});

// Filter buttons
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

renderTasks();
