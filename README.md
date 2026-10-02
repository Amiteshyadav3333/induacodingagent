# Indus Coding Agent

A local macOS coding workspace with Monaco, a project explorer, integrated shell, provider profiles, code generation proposals, and local Ollama support.

## Install the desktop app

Download a release for your system from the GitHub Releases page:

- macOS: Apple silicon or Intel `.pkg` installer and `.zip` app; GitHub Releases also include a `.dmg`
- Windows: x64 `.exe` installer
- Linux: x64 `.AppImage` or `.deb`

On first launch, Indus creates `Documents/Indus Projects`. Use **Settings → Change project folder** to open an existing code folder. Local model inference requires Ollama installed separately; cloud providers need your own API key. Indus does not bundle or silently download a multi-gigabyte model during app startup.

Unsigned preview packages can show operating-system security prompts. Public macOS and Windows releases should be signed/notarized with the publisher's certificates before broad distribution.

## Run from source

```sh
npm install
npm run desktop
```

`npm run desktop` opens the Electron desktop shell with the local backend. `npm run dev` starts the web UI and API for browser development.

## Build installers

```sh
npm run release:mac:arm64
npm run release:mac:x64
npm run release:win:x64
npm run release:linux:x64
```

Each installer is written to `release/`. Build a given installer on its matching OS, or push a `v*` tag to GitHub after publishing this repository; `.github/workflows/release.yml` builds all four targets and attaches them to a GitHub Release. macOS and Windows packages are unsigned until signing credentials are configured.

The default local AI profile connects to Ollama at `http://127.0.0.1:11434/v1` and uses `qwen2.5-coder:7b`. Provider profiles and API keys are stored in this device's browser local storage.

## Debugging, graph, and mobile projects

- **Auto Debug** runs an approved test/build command through a restricted backend endpoint, sends captured stdout/stderr and the issue report to the selected model, applies a safe generated patch, then reruns the same command and reports the result. The regular Builder workflow still previews changes for manual review.
- **Code map** indexes function/type declarations, relative imports, and source call references from the first 100 project files. This lightweight parser is not a compiler or language server; advanced symbol resolution is not included.
- **Mobile projects** scans for Android Gradle, Flutter, Swift, and Xcode tools/project files. The Mobile panel can create a Flutter starter with Android and iOS folders, then build Android APKs or iOS Simulator apps when their SDKs are installed. Build output appears in the panel. Platform builds may download SDK or Gradle dependencies on first run; iOS requires the full Xcode app and does not sign packages for distribution.
- OpenAI-compatible, Anthropic Messages, and Gemini GenerateContent request adapters have mock-server test coverage. Real paid-provider calls require a valid API key and account.

## Verification

```sh
npm run build
npm test
```
