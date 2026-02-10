# Jules Mobile

A cross-platform (iOS / Android / Web) mobile client for [Google Jules](https://jules.google/) — the AI coding assistant. Built with React Native, Expo, and the Jules REST API (`jules.googleapis.com/v1alpha`).

## Features

- 📱 **Cross-Platform** — iOS, Android, and Web from a single codebase (Expo SDK 54)
- 🔍 **Session Management** — List, search, and filter Jules sessions by repository
- 💬 **Real-time Chat** — Send messages to Jules and view responses with 5-second auto-refresh
- 📋 **Plan Review & Approval** — View generated plans step-by-step and approve them directly from the app
- 🔀 **PR Integration** — Open pull requests created by Jules with one tap
- 📝 **Code Diff Viewer** — See changed files with created/edited/deleted indicators
- 🌐 **Multi-language** — English, Japanese (日本語), Korean (한국어), Chinese (中文)
- 🌙 **Dark Mode** — Follows system theme automatically
- 🔐 **Secure Storage** — API key stored via `expo-secure-store` (native) or `localStorage` (web)

## Screenshots

<!-- TODO: Add screenshots -->

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo` — included with Expo SDK)
- A **Jules API key** (see [Configuration](#configuration))

### Install & Run

```bash
git clone https://github.com/yuga-hashimoto/jules-mobile.git
cd jules-mobile
npm install

# Start for iOS
npm run ios

# Start for Android
npm run android

# Start for Web
npm run web

# Or just start the dev server and pick a platform
npm start
```

> **Note:** iOS simulator requires macOS with Xcode. Android emulator requires Android Studio.

## Configuration

1. Get your **Jules API key** from [Google Jules](https://jules.google/) (Google AI Studio / Gemini API)
2. Open the app and go to the **Settings** tab
3. Enter your API key and tap **Save**

The API key is used to authenticate requests to `jules.googleapis.com/v1alpha`. It is stored securely on-device and never sent anywhere else.

## Project Structure

```
jules-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Sessions list (main screen)
│   │   ├── settings.tsx     # API key settings
│   │   └── _layout.tsx      # Tab navigation layout
│   ├── create.tsx           # New session creation
│   ├── session/[id].tsx     # Session detail & chat
│   └── _layout.tsx          # Root layout (Paper theme)
├── services/
│   └── jules.ts             # Jules API client (axios)
├── constants/
│   └── Colors.ts            # Jules-themed color palette
├── i18n/
│   └── index.ts             # i18next translations (en/ja/ko/zh)
├── components/              # Shared UI components
├── assets/                  # Icons, splash, fonts
└── .github/workflows/       # CI: iOS & Android builds
```

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1alpha/sources` | List connected repositories |
| GET | `/v1alpha/sessions` | List all sessions |
| POST | `/v1alpha/sessions` | Create a new session |
| GET | `/v1alpha/sessions/{id}` | Get session details |
| GET | `/v1alpha/sessions/{id}/activities` | List session activities |
| POST | `/v1alpha/sessions/{id}:sendMessage` | Send a message to Jules |
| POST | `/v1alpha/sessions/{id}:approvePlan` | Approve a generated plan |

## Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 54) + [React Native](https://reactnative.dev/) 0.81
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based routing)
- **UI:** [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design 3)
- **HTTP:** [Axios](https://axios-http.com/)
- **i18n:** [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)
- **Secure Storage:** [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)

## CI/CD

GitHub Actions workflows are included for building:

- **iOS** (`.github/workflows/build-ios.yml`) — Simulator build on `macos-latest`
- **Android** (`.github/workflows/build-android.yml`)

Triggered on `workflow_dispatch` or version tags (`v*`).

## License

MIT
