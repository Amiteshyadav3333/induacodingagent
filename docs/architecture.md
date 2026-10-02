# Architecture

The MVP uses a small local HTTP boundary between UI and project operations. The Vite/React renderer talks to an Express service bound to `127.0.0.1`; project paths are resolved and checked to stay inside the selected root. The integrated shell uses a WebSocket to a persistent local shell process scoped to the selected project directory. WebSocket origins are restricted to the local app. AI calls use OpenAI-compatible, Anthropic Messages, or Gemini GenerateContent adapters. Provider credentials currently remain in browser local storage.

Planned evolution: move provider clients and role orchestration into `packages/ai-core`, add a durable project database and embedding index, add language-server adapters for symbol graphs, add tracing adapters for supported runtimes, and package/sign the Swift WebKit shell, plus add Windows/Linux shells with explicit filesystem and process permissions.
