# UrbanLearn

UrbanLearn is a Chrome extension that radically modernizes the PrairieLearn student interface. It replaces the legacy Bootstrap 4 tables and rigid bordered containers with a responsive, fluid, card-based interface, and features a complete dynamic Dark & Light Theme engine.

## Features

- **Immaculate Dark Mode & Modern Light Mode:** Smooth, accessible variables completely override PrairieLearn's default styling, providing glass-like aesthetics, rounded drop-shadow cards, and custom primary/secondary buttons.
- **Card-Based Architecture:** The legacy tabular layout for courses and assessments was stripped. Re-imagined CSS grid modules now display assignments individually, extracting and prominently embedding their deadlines cleanly without needing popovers.
- **Intelligent Input Wrapping:** Number inputs, radio buttons, and checkboxes have been completely re-coded.
- **Live Theme Switching:** A floating toggle persists at bottom right, instantly swapping between themes without flashing, and saving preferences to `localStorage`.
- **Vanilla Override Switch (The Magic Wand):** Need access to the old PrairieLearn natively? Hit the code (`< >`) icon on your action palette to force a clean runtime detach, shutting down all visual operations and immediately releasing PrairieLearn to its unadulterated state. 

## Installation

This extension is built for Chromium browsers (Chrome, Edge, Brave, Arc, etc.) and is currently in developer preview. You must side-load it as an unpacked extension.

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/yigitkerem/urbanlearn.git
   ```
   Or download the `.zip` archive and extract it in a safe folder.

2. **Open the Extension Manager:**
   - In Chrome, navigate to `chrome://extensions/` in your URL bar.
   - Or click the puzzle piece icon -> "Manage Extensions".

3. **Enable Developer Mode:**
   - Toggle the switch in the top right labeled **Developer mode** to the `ON` position.

4. **Load the unpacked extension:**
   - Click the **Load unpacked** button in the top left corner.
   - Navigate into your downloaded `urbanlearn` directory and **select the `src/` folder** (this is the folder that contains `manifest.json`).

5. **Ready!**
   - Head over to [PrairieLearn](https://prairielearn.com/) and you should immediately be greeted by the new UrbanLearn dashboard. Use the floating widget in the bottom right to tweak your exact preferences.

## File Structure

- `src/manifest.json`: Configuration logic declaring permissions and content boundaries.
- `src/content.js`: Core mutation scripting. Handles DOM rebuilding, legacy node deletion, timeline parsing, and event overlays.
- `src/styles.css`: The massive global ecosystem of CSS mappings, `!important` rule overrides, pseudo-element generation, and `:root` theme variable definitions. 

## Customization

The extension runs entirely locally. If you'd like to adjust the exact highlight color (`--accent-bg`), spacing, or shadow diffusions, directly modify the `request` tokens defined at the top of `src/styles.css`. Refresh the PrairieLearn webpage to see your modifications update live in the DOM.
