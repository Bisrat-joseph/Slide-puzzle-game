# 🧩 Interactive Image Slide Puzzle
> **Project 1: The Responsive Architecture** — Built for the DecodeLabs Internship Program.

A lightweight, fully responsive 3x3 sliding image puzzle application built entirely with pure HTML5, CSS3, and Vanilla JavaScript—no external frameworks or libraries used.

---

## ✨ Features

- **🎮 Solvability Guaranteed:** Uses a move-backtrack shuffle algorithm to ensure every generated puzzle state is 100% solvable.
- **🎨 2025 Aesthetic Palette:** Styled using *Mocha Mousse* (`#A5856F`), *Ethereal Blue* (`#A0D4E0`), and *Moonlit Grey* (`#F2F0EA`).
- **📱 Mobile-First Responsive Design:** Adapts smoothly across mobile devices, tablets (`768px`), and desktop monitors (`1024px+`).
- **⏱️ Real-Time Metrics:** Live tracking for move counter and an active game timer (`MM:SS`).
- **🔢 Toggleable Overlay:** Ability to show/hide tile numbering over the image slices for variable difficulty.
- **♿ Semantic & Accessible:** Structural HTML5 landmarks (`<header>`, `<main>`, `<footer>`) with ARIA attributes for screen-reader readability.

---

## 🛠️ Tech Stack & Architecture

- **Markup:** Semantic HTML5 (`index.html`)
- **Styling:** CSS3 (Grid macro-layouts, Flexbox micro-components, `clamp()` fluid typography)
- **Logic:** Vanilla ES6+ JavaScript (`script.js`)
- **Dependencies:** **Zero** (Pure web fundamentals)

---

## 📁 Project Structure

```text
├── index.html   # Semantic structure & accessibility landmarks
├── style.css    # Responsive styles, design variables & CSS grid
└── script.js    # State management, shuffle algorithm & timer logic

🚀 Quick Start
No build tools or package managers required.

Clone the repository:

Bash
git clone https://github.com/https://github.com/Bisrat-joseph/DecodeLabs-Internship..git
Navigate into the directory:

Bash
cd DecodeLabs-Internship.
Run the application:

Double-click index.html to open it directly in your browser, or

Use VS Code's Live Server extension to launch local development.

👨‍💻 Author
Name: Bisrat Yosef

GitHub: Bisrat-joseph


---

### How to add it to your project via terminal:

```bash
# Create the file (or open it in your editor)
code README.md
Once pasted, commit and push it to GitHub:

Bash
git add README.md
git commit -m "docs: add comprehensive project README"
git push origin main
