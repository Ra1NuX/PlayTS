# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlayTS (repo: OpenTS/RunTS) is an open-source desktop+web application for executing and transpiling TypeScript/JavaScript code. It runs as an Electron desktop app (using Node.js child processes for code execution) or as a web app (using WebContainers for browser-based Node.js execution).

## Common Commands

```bash
npm run electron:dev     # Full dev mode (Vite + Electron concurrently)
npm run dev              # Vite dev server only (web mode, localhost:5173)
npm run build            # Full build (renderer via Vite + main via esbuild)
npm run build:renderer   # Vite build only
npm run build:electron   # esbuild main process only
npm run lint             # ESLint
npm test                 # Jest tests (ts-jest)
npm run dist             # Package Windows executable
npm run dist:linux       # Package Linux AppImage
```

## Architecture

### Dual Execution Model

The app detects its runtime environment via `src/utils/environment.ts`:
- **Electron**: Code is sent over IPC (`window.electron.executeCode`) to `main/codeExecutor.ts`, which spawns a Node.js process in a temp directory (`/tmp/runts-execution/{uid}/`).
- **Web**: Code runs in a WebContainer (`@webcontainer/api`) — a browser-based Node.js sandbox.

### Code Execution Pipeline

1. User edits code in Monaco Editor (`src/components/EditorComponent.tsx`)
2. TypeScript transpilation (`src/tools/convertToJS.ts`) — preserves line numbers via `/*__RUNTS_LINE_N__*/` comment markers
3. Active bookmark code is injected (`src/utils/bookmarkInjection.ts`)
4. Active environment variables are injected (`src/hooks/useGlobalEnvVars.ts`)
5. Execution dispatched based on environment (IPC or WebContainer)
6. Output aligned to source lines (`createAlignedOutput.ts`) and displayed

### Key Directories

- `src/` — React renderer (components, hooks, stores, utils)
- `main/` — Electron main process (IPC handlers, code executor, preload script)
- `public/locales/` — i18n translation files (en, es, zh)

### State Management

- **Zustand stores** (`src/stores/`): `bookmarksStore.ts` and `envVarsStore.ts` — both persist to localStorage
- **useCompiler hook**: Global code/result state using a listener pattern (not Zustand)
- Code is stored base64-encoded in `localStorage["code"]`

### Bookmark System

Bookmarks are reusable code snippets. When marked "globally active", their transpiled code is injected before every execution. Type declarations are generated via Acorn AST parsing (`src/utils/typeGeneration.ts`) and fed to Monaco for autocomplete.

### Build Tooling

- **Vite** bundles the React renderer (output: `./app/renderer`)
- **esbuild** (`esbuild.config.mjs`) bundles the Electron main process (entry: `main/index.ts`, `main/preload.ts`)
- **Electron Builder** (`electron-builder.config.js`) packages the desktop app
- Custom COEP/COOP/CORP headers in Vite config for WebContainer support

### IPC Channels (Electron)

`code/execute`, `package/install`, `package/uninstall`, `env/info`, `app/minimize`, `app/maximize`, `app/close`, `app/version`

### AI Integration

Supports OpenAI, Google Gemini, and Anthropic Claude via provider-specific call modules. Chat UI in sidebar (`src/components/chat/`). Models and API keys stored in settings.

### i18n

Uses i18next with namespaces `common` and `desktop`. Detection order: localStorage → sessionStorage → cookie → navigator. Fallback: English.
