# Attribute Highlighter

Chrome extension that highlights elements with specific attributes (`data-cy`, `data-testid`, `data-test`, etc.) on any page.

## Features
- Toggle highlighting on/off (persists across page reloads)
- Keyboard shortcut to toggle highlighting (`Alt+Shift+H` by default)
- Labels showing attribute names and values
- Two rule modes:
  - **has attr** — highlight any element with this attribute
  - **attr = val** — highlight only when attribute matches a specific value
- Custom rules with color picker
- Add/remove rules from the popup
- Copy button on each label — configurable to copy attribute + value or value only

## Install
1. Clone this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the cloned folder

## Default Rules
| Attribute | Color |
|-----------|-------|
| `data-cy` | Blue |
| `data-testid` | Sky Blue |
| `data-test` | Cyan |

## Keyboard Shortcut
The default shortcut to toggle highlighting is `Alt+Shift+H`. To change it:
1. Go to `chrome://extensions/shortcuts`
2. Find **Attribute Highlighter**
3. Click the pencil icon next to **Toggle attribute highlighting**
4. Press your desired key combination

## Usage
Click the extension icon → Toggle ON → elements with test attributes get highlighted with colored outlines and labels. You can also use the keyboard shortcut to toggle without opening the popup.

Use the **Copy button** dropdown to control what gets copied when you click the clipboard icon on a label:
- **Disabled** — no copy button shown
- **Attribute + Value** — copies `data-cy="login-btn"`
- **Value only** — copies `login-btn`
