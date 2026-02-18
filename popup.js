// DEFAULT_RULES is provided by shared.js

let rules = [];

function sendToTab(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (chrome.runtime.lastError) return; // content script not available
      if (callback) callback(response);
    });
  });
}

function renderRules() {
  const container = document.getElementById("rules");
  container.innerHTML = "";

  rules.forEach((rule, i) => {
    const div = document.createElement("div");
    div.className = "rule";

    // Type selector
    const typeSelect = document.createElement("select");
    typeSelect.className = "type-select";
    const hasOpt = document.createElement("option");
    hasOpt.value = "has";
    hasOpt.textContent = "has attr";
    hasOpt.selected = rule.type === "has";
    const eqOpt = document.createElement("option");
    eqOpt.value = "equals";
    eqOpt.textContent = "attr = val";
    eqOpt.selected = rule.type === "equals";
    typeSelect.appendChild(hasOpt);
    typeSelect.appendChild(eqOpt);

    // Attribute name input
    const attrInput = document.createElement("input");
    attrInput.type = "text";
    attrInput.className = "attr-input";
    attrInput.value = rule.attribute;
    attrInput.placeholder = "attribute";

    // Value input (visible only for "equals" type)
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "value-input value-field" + (rule.type === "equals" ? " show" : "");
    valueInput.value = rule.value || "";
    valueInput.placeholder = "value";

    // Color picker
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.className = "color-input";
    colorInput.value = rule.color;

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "x";

    div.appendChild(typeSelect);
    div.appendChild(attrInput);
    div.appendChild(valueInput);
    div.appendChild(colorInput);
    div.appendChild(deleteBtn);
    container.appendChild(div);

    // Event listeners
    typeSelect.addEventListener("change", () => {
      rules[i].type = typeSelect.value;
      saveAndRefresh();
      renderRules();
    });

    attrInput.addEventListener("change", () => {
      rules[i].attribute = attrInput.value;
      saveAndRefresh();
    });

    valueInput.addEventListener("change", () => {
      rules[i].value = valueInput.value;
      saveAndRefresh();
    });

    colorInput.addEventListener("input", () => {
      rules[i].color = colorInput.value;
      saveAndRefresh();
    });

    deleteBtn.addEventListener("click", () => {
      rules.splice(i, 1);
      saveAndRefresh();
      renderRules();
    });
  });
}

function saveAndRefresh() {
  chrome.storage.sync.set({ rules }, () => {
    sendToTab({ action: "refresh" });
  });
}

// Toggle button
document.getElementById("toggleBtn").addEventListener("click", () => {
  sendToTab({ action: "toggle" }, (response) => {
    if (response) updateToggleUI(response.active);
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
    sendToTab({ action: "refresh" });
  });
});

// Init: load rules and copy mode
chrome.storage.sync.get(["rules", "copyMode"], (data) => {
  rules = data.rules && data.rules.length > 0 ? data.rules : DEFAULT_RULES;
  renderRules();
  document.getElementById("copyMode").value = data.copyMode || "both";
});

// Init: get current highlight state from content script
sendToTab({ action: "getState" }, (response) => {
  if (response) updateToggleUI(response.active);
});
