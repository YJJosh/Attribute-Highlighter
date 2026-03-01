// Attribute Highlighter — Content Script
// DEFAULT_RULES is provided by shared.js

let labelPairs = []; // [{labelEl, element}]
let active = false;
let copyMode = "both";

// Validate attribute name to prevent CSS selector injection
function isValidAttribute(attr) {
  return typeof attr === "string" && /^[a-zA-Z_][\w.-]*$/.test(attr);
}

// Escape a value for use inside a CSS attribute selector: [attr="value"]
function escapeSelectorValue(val) {
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function clearHighlights() {
  document.querySelectorAll(".attr-highlight-outline").forEach((el) => {
    el.classList.remove("attr-highlight-outline");
    el.style.removeProperty("outline-color");
  });
  labelPairs.forEach(({ labelEl }) => labelEl.remove());
  labelPairs = [];
}

function repositionLabels() {
  labelPairs.forEach(({ labelEl, element }) => {
    const rect = element.getBoundingClientRect();
    labelEl.style.top = `${window.scrollY + rect.top - 16}px`;
    labelEl.style.left = `${window.scrollX + rect.left}px`;
  });
}

function applyHighlights(rules) {
  clearHighlights();

  rules.forEach((rule) => {
    if (rule.enabled === false) return;
    if (!isValidAttribute(rule.attribute)) return;

    let selector;
    if (rule.type === "has") {
      selector = `[${rule.attribute}]`;
    } else if (rule.type === "equals") {
      selector = `[${rule.attribute}="${escapeSelectorValue(rule.value || "")}"]`;
    } else {
      return;
    }

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.add("attr-highlight-outline");
      el.style.setProperty("outline-color", rule.color, "important");

      if (rule.label) {
        const attrValue = el.getAttribute(rule.attribute);
        const labelEl = document.createElement("div");
        labelEl.className = "attr-highlight-label";
        labelEl.style.background = rule.color;

        const textSpan = document.createElement("span");
        textSpan.textContent = `${rule.attribute}="${attrValue}"`;
        labelEl.appendChild(textSpan);

        if (copyMode !== "off") {
          const copyBtn = document.createElement("button");
          copyBtn.className = "attr-highlight-copy-btn";
          copyBtn.textContent = "\u{1F4CB}";
          copyBtn.title =
            copyMode === "both"
              ? `Copy: ${rule.attribute}="${attrValue}"`
              : `Copy: ${attrValue}`;
          copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const copyText =
              copyMode === "both"
                ? `${rule.attribute}="${attrValue}"`
                : attrValue;
            navigator.clipboard.writeText(copyText).then(() => {
              copyBtn.classList.add("attr-highlight-copied");
              copyBtn.textContent = "\u2713";
              setTimeout(() => {
                copyBtn.classList.remove("attr-highlight-copied");
                copyBtn.textContent = "\u{1F4CB}";
              }, 1000);
            });
          });
          labelEl.appendChild(copyBtn);
        }

        const rect = el.getBoundingClientRect();
        labelEl.style.position = "absolute";
        labelEl.style.top = `${window.scrollY + rect.top - 16}px`;
        labelEl.style.left = `${window.scrollX + rect.left}px`;

        document.body.appendChild(labelEl);
        labelPairs.push({ labelEl, element: el });
      }
    });
  });
}

function loadAndApply() {
  chrome.storage.sync.get(["rules", "copyMode"], (data) => {
    const rules = data.rules && data.rules.length > 0 ? data.rules : DEFAULT_RULES;
    copyMode = data.copyMode || "both";
    // Pause observer while we modify the DOM ourselves
    stopObserver();
    applyHighlights(rules);
    if (active) startObserver();
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "toggle") {
    active = !active;
    chrome.storage.local.set({ active });
    if (active) {
      loadAndApply();
      startObserver();
    } else {
      stopObserver();
      clearHighlights();
    }
    sendResponse({ active });
  }

  if (msg.action === "refresh") {
    if (active) {
      loadAndApply();
    }
    sendResponse({ active });
  }

  if (msg.action === "getState") {
    sendResponse({ active, copyMode });
  }

  return true;
});

// Throttled repositioning (rAF instead of full rebuild)
let repositionRAF = null;
function scheduleReposition() {
  if (!active || labelPairs.length === 0) return;
  if (repositionRAF) return;
  repositionRAF = requestAnimationFrame(() => {
    repositionLabels();
    repositionRAF = null;
  });
}
window.addEventListener("scroll", scheduleReposition);
window.addEventListener("resize", scheduleReposition);

// MutationObserver: re-apply highlights when the DOM changes
let mutationTimer = null;
const observer = new MutationObserver(() => {
  if (!active) return;
  // Debounce — wait for DOM to settle before re-highlighting
  clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => loadAndApply(), 300);
});

function startObserver() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function stopObserver() {
  observer.disconnect();
  clearTimeout(mutationTimer);
}

// Restore active state on page load
chrome.storage.local.get(["active"], (data) => {
  if (data.active) {
    active = true;
    loadAndApply();
    startObserver();
  }
});
