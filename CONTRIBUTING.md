# Contributing to Open Zero Launcher

Thank you for your interest in contributing! Open Zero Launcher is a completely free, open-source project and we welcome contributions from the community. This guide will help you get started.

If you have any questions, feel free to [open an issue](https://github.com/primedeploy/open-zero-launcher/issues/new).

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [License](#license)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone. Harassment, discrimination, or abusive behavior of any kind will not be tolerated.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android emulator and builds)
- **Git**

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on the [GitHub repository](https://github.com/primedeploy/open-zero-launcher).

2. **Clone your fork**

   ```bash
   git clone https://github.com/<your-username>/open-zero-launcher.git
   cd open-zero-launcher
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on Android**

   ```bash
   npm run android
   ```

6. **Run tests**

   ```bash
   npm test
   ```

---

## Project Structure

```
open-zero-launcher/
├── app/                    # Expo Router screens (layouts & pages)
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Home screen
├── src/
│   ├── assets/             # Images and static assets
│   ├── components/         # Reusable UI components
│   ├── controllers/        # Custom hooks and business logic
│   ├── services/           # Data services (database, storage, API)
│   ├── stores/             # Zustand state management stores
│   └── types/              # TypeScript type definitions
├── _tests/                 # Unit tests
├── android/                # Native Android project files
├── ios/                    # Native iOS project files
└── ...config files
```

### Key Technologies

| Technology       | Purpose                  |
| ---------------- | ------------------------ |
| React Native     | Mobile UI framework      |
| Expo (SDK 54)    | Development platform     |
| Expo Router      | File-based routing       |
| Zustand          | State management         |
| Expo SQLite      | Local database           |
| AsyncStorage     | Key-value local storage  |
| Jest             | Testing framework        |
| TypeScript       | Type safety              |
| Prettier         | Code formatting          |

---

## How to Contribute

### Reporting Bugs

- Search [existing issues](https://github.com/primedeploy/open-zero-launcher/issues) to avoid duplicates.
- Use a clear and descriptive title.
- Include steps to reproduce the issue.
- Mention your device model, Android version, and app version.
- Attach screenshots or logs if applicable.

### Suggesting Features

- Open an issue with the **feature request** label.
- Describe the problem your feature would solve.
- Explain your proposed solution.
- Consider how it aligns with the project's minimalist philosophy.

### Submitting Code

1. Create a fork of this repository.
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the [Coding Standards](#coding-standards).
4. Write or update tests as needed.
5. Commit your changes following the [Commit Guidelines](#commit-guidelines).
6. Push your branch and open a pull request.

---

## Commit Guidelines

Write all commits **in English**. We recommend using [Conventional Commits](https://www.conventionalcommits.org/) for better semantics and readability:

| Prefix       | Usage                                      |
| ------------ | ------------------------------------------ |
| `feat:`      | A new feature                              |
| `fix:`       | A bug fix                                  |
| `docs:`      | Documentation changes                      |
| `style:`     | Formatting, missing semicolons, etc.       |
| `refactor:`  | Code refactoring (no feature/fix)          |
| `test:`      | Adding or updating tests                   |
| `chore:`     | Build process, tooling, dependencies       |
| `perf:`      | Performance improvements                   |

### Examples

```
feat: add search bar to app list
fix: resolve notification badge not updating
docs: update README with build instructions
refactor: extract weather logic into custom hook
test: add unit tests for storageService
```

---

## Pull Request Process

1. Ensure your code builds and all tests pass (`npm test`).
2. Update documentation if your change affects it.
3. Provide a clear and concise PR description:
   - **What** was changed and **why**.
   - Link to related issues (e.g., `Closes #42`).
   - Screenshots for UI changes.
4. Keep pull requests focused — one feature or fix per PR.
5. Be responsive to review feedback.
6. Your PR will be reviewed and, once approved, merged into `main`.

---

## Coding Standards

- **Language**: TypeScript (`.ts` / `.tsx` files).
- **Formatting**: Use Prettier for consistent formatting.
- **Components**: Use functional components with hooks.
- **State management**: Use Zustand stores (located in `src/stores/`).
- **Naming conventions**:
  - Components: `PascalCase` (e.g., `AppItem.tsx`)
  - Hooks: `camelCase` with `use` prefix (e.g., `useClock.ts`)
  - Services: `camelCase` with `Service` suffix (e.g., `storageService.ts`)
  - Types: `PascalCase` (e.g., `App`)
- **File organization**: Place files in the appropriate `src/` subdirectory.
- **Keep it minimal**: This project values simplicity. Avoid unnecessary dependencies or over-engineered solutions.

---

## Testing

- Tests are located in the `_tests/` directory.
- We use **Jest** with **@testing-library/react-native**.
- Run all tests:
  ```bash
  npm test
  ```
- When adding new features, include corresponding unit tests.
- When fixing bugs, add a test that reproduces the issue.

---

## License

By contributing to Open Zero Launcher, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

**Thank you for helping make Open Zero Launcher better! 🚀**