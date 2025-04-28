# shadcn-remover CLI

<!-- Badges -->
[![NPM Version](https://img.shields.io/npm/v/shadcn-remover.svg?style=flat-square)](https://www.npmjs.com/package/shadcn-remover)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/node/v/shadcn-remover.svg?style=flat-square)](https://nodejs.org/en/download/current/)
[![GitHub Issues](https://img.shields.io/github/issues/exodus-tola-mindCoder/shadcn-remover.svg?style=flat-square)](https://github.com/exodus-tola-mindCoder/shadcn-remover/issues)
[![GitHub Stars](https://img.shields.io/github/stars/exodus-tola-mindCoder/shadcn-remover.svg?style=flat-square)](https://github.com/exodus-tola-mindCoder/shadcn-remover/stargazers)

**A simple command-line tool to quickly remove Shadcn UI components from your project.**

<!-- Optional: Add a Logo/Banner Image Here -->
<!-- ![shadcn-remover Logo](link/to/your/logo.png) -->

<!-- Optional: Add a GIF Demo Here -->
<!-- ![shadcn-remover Demo](link/to/your/demo.gif) -->

This CLI tool helps you clean up your project by removing specified Shadcn UI components. It looks for components within the standard `src/components/ui` directory and can remove both individual component files (`.tsx`) and component directories.

---

## ✨ Features

* **Remove Specific Components:** Target one or more components by name.
* **Remove All Components:** Option to remove all detected components at once.
* **Interactive Mode:** Select components to remove from a list if none are specified.
* **Dry Run:** Preview which files/directories would be removed without making changes.
* **Flexible Detection:** Handles both file-based (`button.tsx`) and directory-based (`dialog/`) component structures.
* **User-Friendly:** Provides clear feedback with progress spinners and colored output.
* **Safe:** Includes confirmation prompts before deleting files.
* **Lightweight & Fast:** Built with modern tools for efficiency.

---

## ⚙️ Requirements

---

* **Node.js:** Version 18.0.0 or higher (`>=18.0.0`)
* **npm** (or yarn/pnpm)

---

## 🚀 Installation

Install the tool **globally** using your preferred package manager:

```bash
# Using npm
npm install -g shadcn-remover

# Using yarn
yarn global add shadcn-remover

# Using pnpm
pnpm add -g shadcn-remover

💡 Usage
---
Navigate to the root directory of your project in your terminal and run the command:

```bash
shadcn-remover [components...] [options]

Arguments:
   [components...]: (Optional) A space-separated list of component names to remove (e.g., button card dialog).

Option Alias Description Default

--all -a Attempt to remove all detected Shadcn UI components false
--dry-run -d Show what would be removed without actually deleting files/directories false
--version -V Display the version number 
--help -h Display help information

Examples:

# Remove specific components (button, alert-dialog, sheet)
shadcn-remover button alert-dialog sheet

# Remove all components (will prompt for confirmation)
shadcn-remover --all

# Start interactive mode (prompts you to select components)
shadcn-remover

# Dry run: See what would happen if you removed the 'card' component
shadcn-remover card --dry-run

# Dry run: See what would happen if you removed all components
shadcn-remover --all --dry-run
---
📁 Configuration

---
By default, shadcn-remover expects your Shadcn UI components to be located in:

<your-project-root>/src/components/ui/

---
Ensure you run the command from your project's root directory for the path detection to work correctly.


---
🤝 Contributing

---
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request.

-----------------------------------------------------
👤 Author
Exodus-Tola

GitHub: @exodus-tola-mindCoder
-----------------------------------------------------
📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
----------------------------------------------------------------------------------
Keywords: cli, shadcn, shadcn-ui, ui, components, remove, delete, cleanup, utility, tool, nodejs.
