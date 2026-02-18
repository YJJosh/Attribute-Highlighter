# Attribute Highlighter

Chrome extension that highlights elements with specific attributes (`data-cy`, `data-testid`, `data-test`, etc.) on any page.

## Features
- Toggle highlighting on/off
- Labels showing attribute names and values
- Two rule modes:
  - **has attr** — highlight any element with this attribute
  - **attr = val** — highlight only when attribute matches a specific value
- Custom rules with color picker
- Add/remove rules from the popup

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

## Usage
Click the extension icon → Toggle ON → elements with test attributes get highlighted with colored outlines and labels.
