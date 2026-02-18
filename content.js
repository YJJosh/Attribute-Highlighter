// Attribute Highlighter — Content Script

let labels = [];
let active = false;

// Default rules
const DEFAULT_RULES = [
  { type: "has", attribute: "data-cy", color: "#4466ff", label: true },
  { type: "has", attribute: "data-testid", color: "#44aaff", label: true },
  { type: "has", attribute: "data-test", color: "#44ddff", label: true },
];

// Copy mode: "off" | "both" | "value"
let copyMode = "both";

function clearHighlights() {
  // Remove outlines
  document.querySelectorAll(".attr-highlight-outline").forEach((el) => {
    el.classList.remove("attr-highlight-outline");
    el.style.removeProperty("outline-color");
  });
  // Remove labels
  labels.forEach((label) => label.remove());
  labels = [];
}

function applyHighlights(rules) {
  clearHighlights();

  rules.forEach((rule) => {
    let selector;
    if (rule.type === "has") {
      // Match any element that has this attribute (any value)
      selector = `[${rule.attribute}]`;
    } else if (rule.type === "equals") {
      // Match attribute = specific value
      selector = `[${rule.attribute}="${rule.value}"]`;
    } else {
      return;
    }

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      // Add outline
      el.classList.add("attr-highlight-outline");
      el.style.setProperty("outline-color", rule.color, "important");

      // Add label showing the attribute value
      if (rule.label) {
        const attrValue = el.getAttribute(rule.attribute);
        const labelEl = document.createElement("div");
        labelEl.className = "attr-highlight-label";
        labelEl.style.background = rule.color;

        // Text span
        const textSpan = document.createElement("span");
        textSpan.textContent = `${rule.attribute}="${attrValue}"`;
        labelEl.appendChild(textSpan);

        // Copy button (if enabled)
        if (copyMode !== "off") {
          const copyBtn = document.createElement("button");
          copyBtn.className = "attr-highlight-copy-btn";
          copyBtn.textContent = "📋";
          copyBtn.title = copyMode === "both" 
            ? `Copy: ${rule.attribute}="${attrValue}"` 
            : `Copy: ${attrValue}`;
          copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const copyText = copyMode === "both" 
              ? `${rule.attribute}="${attrValue}"` 
              : attrValue;
            navigator.clipboard.writeText(copyText).then(() => {
              copyBtn.classList.add("attr-highlight-copied");
              copyBtn.textContent = "✓";
              setTimeout(() => {
                copyBtn.classList.remove("attr-highlight-copied");
                copyBtn.textContent = "📋";
              }, 1000);
            });
          });
          labelEl.appendChild(copyBtn);
        }

        // Position the label
        const rect = el.getBoundingClientRect();
        labelEl.style.position = "absolute";
        labelEl.style.top = `${window.scrollY + rect.top - 16}px`;
        labelEl.style.left = `${window.scrollX + rect.left}px`;

        document.body.appendChild(labelEl);
        labels.push(labelEl);
      }
    });
  });
}

function loadAndApply() {
  chrome.storage.sync.get(["rules", "copyMode"], (data) => {
    const rules = data.rules && data.rules.length > 0 ? data.rules : DEFAULT_RULES;
    copyMode = data.copyMode || "both";
    applyHighlights(rules);
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "toggle") {
    active = !active;
    if (active) {
      loadAndApply();
    } else {
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

// Reposition labels on scroll
window.addEventListener("scroll", () => {
  if (active) loadAndApply();
});
