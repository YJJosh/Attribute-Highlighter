const DEFAULT_RULES = [
  { type: "has", attribute: "data-cy", color: "#4466ff", value: "", label: true },
  { type: "has", attribute: "data-testid", color: "#44aaff", value: "", label: true },
  { type: "has", attribute: "data-test", color: "#44ddff", value: "", label: true },
];

let rules = [];

function renderRules() {
  const container = document.getElementById("rules");
  container.innerHTML = "";

  rules.forEach((rule, i) => {
    const div = document.createElement("div");
    div.className = "rule";
    div.innerHTML = `
      <select class="type-select" data-i="${i}">
        <option value="has" ${rule.type === "has" ? "selected" : ""}>has attr</option>
        <option value="equals" ${rule.type === "equals" ? "selected" : ""}>attr = val</option>
      </select>
      <input type="text" class="attr-input" data-i="${i}" value="${rule.attribute}" placeholder="attribute">
      <input type="text" class="value-input value-field ${rule.type === "equals" ? "show" : ""}" data-i="${i}" value="${rule.value || ""}" placeholder="value">
      <input type="color" class="color-input" data-i="${i}" value="${rule.color}">
      <button class="delete-btn" data-i="${i}">x</button>
    `;
    container.appendChild(div);
  });

  // Event listeners
  container.querySelectorAll(".type-select").forEach((el) => {
    el.addEventListener("change", (e) => {
      const i = parseInt(e.target.dataset.i);
      rules[i].type = e.target.value;
      saveAndRefresh();
      renderRules();
    });
  });

  container.querySelectorAll(".attr-input").forEach((el) => {
    el.addEventListener("change", (e) => {
      const i = parseInt(e.target.dataset.i);
      rules[i].attribute = e.target.value;
      saveAndRefresh();
    });
  });

  container.querySelectorAll(".value-input").forEach((el) => {
    el.addEventListener("change", (e) => {
      const i = parseInt(e.target.dataset.i);
      rules[i].value = e.target.value;
      saveAndRefresh();
    });
  });

  container.querySelectorAll(".color-input").forEach((el) => {
    el.addEventListener("input", (e) => {
      const i = parseInt(e.target.dataset.i);
      rules[i].color = e.target.value;
      saveAndRefresh();
    });
  });

  container.querySelectorAll(".delete-btn").forEach((el) => {
    el.addEventListener("click", (e) => {
      const i = parseInt(e.target.dataset.i);
      rules.splice(i, 1);
      saveAndRefresh();
      renderRules();
    });
  });
}

function saveAndRefresh() {
  chrome.storage.sync.set({ rules }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "refresh" });
      }
    });
  });
}

// Toggle button
document.getElementById("toggleBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" }, (response) => {
        if (response) updateToggleUI(response.active);
      });
    }
  });
});

function updateToggleUI(active) {
  const btn = document.getElementById("toggleBtn");
  const status = document.getElementById("status");
  if (active) {
    btn.className = "toggle-btn on";
    btn.textContent = "ON";
    status.textContent = "Highlighting active";
    status.style.color = "#ff4444";
  } else {
    btn.className = "toggle-btn off";
    btn.textContent = "OFF";
    status.textContent = "OFF";
    status.style.color = "#666";
  }
}

// Add rule button
document.getElementById("addRule").addEventListener("click", () => {
  rules.push({ type: "has", attribute: "", color: "#44aaff", value: "", label: true });
  saveAndRefresh();
  renderRules();
});

// Copy mode selector
document.getElementById("copyMode").addEventListener("change", (e) => {
  chrome.storage.sync.set({ copyMode: e.target.value }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "refresh" });
      }
    });
  });
});

// Init
chrome.storage.sync.get(["rules", "copyMode"], (data) => {
  rules = data.rules && data.rules.length > 0 ? data.rules : DEFAULT_RULES;
  renderRules();
  document.getElementById("copyMode").value = data.copyMode || "both";
});

// Get current state
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getState" }, (response) => {
      if (response) updateToggleUI(response.active);
    });
  }
});
