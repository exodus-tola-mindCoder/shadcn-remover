# shadcn-remover CLI

[![NPM Version](https://img.shields.io/npm/v/shadcn-remover.svg?style=flat-square)](https://www.npmjs.com/package/shadcn-remover)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/node/v/shadcn-remover.svg?style=flat-square)](https://nodejs.org/en/download/current/)
[![GitHub Issues](https://img.shields.io/github/issues/exodus-tola-mindCoder/shadcn-remover.svg?style=flat-square)](https://github.com/exodus-tola-mindCoder/shadcn-remover/issues)
[![GitHub Stars](https://img.shields.io/github/stars/exodus-tola-mindCoder/shadcn-remover.svg?style=flat-square)](https://github.com/exodus-tola-mindCoder/shadcn-remover/stargazers)

**A simple command-line tool to quickly remove Shadcn UI components from your project.**

This CLI tool helps you clean up your project by removing specified Shadcn UI components. It looks for components within the standard `src/components/ui` directory (relative to where you run the command) and can remove both individual component files (`.tsx`) and component directories.

## ✨ Features

*   **Remove Specific Components:** Target one or more components by name.
*   **Remove All Components:** Option to remove all detected components at once.
*   **Interactive Mode:** Select components to remove from a list if none are specified.
*   **Dry Run:** Preview which files/directories would be removed without making changes.
*   **Flexible Detection:** Handles both file-based (`button.tsx`) and directory-based (`dialog/`) component structures.
*   **User-Friendly:** Provides clear feedback with progress spinners and colored output.
*   **Safe:** Includes confirmation prompts before deleting files.
*   **Lightweight & Fast:** Built with modern tools for efficiency.

## ⚙️ Requirements

*   **Node.js:** Version 18.0.0 or higher (`>=18.0.0`)
*   **npm** (or yarn/pnpm)

## 🚀 Installation

Install the tool globally using your preferred package manager:

```bash
# Using npm
npm install -g shadcn-remover

# Using yarn
yarn global add shadcn-remover

# Using pnpm
pnpm add -g shadcn-remover

💡 Usage

shadcn-remover [components...] [options]


📁 Configuration

<your-project-root>/src/components/ui/
Ensure you run the command from your project's root directory for the path detection to work correctly.

🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request

👤 Author
Exodus-Tola
GitHub: @exodus-tola-mindCoder

📜 License
This project is licensed under the MIT License - see the LICENSE file for details
