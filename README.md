# 🖥️ DeskBridge

DeskBridge is a real-time remote desktop application that enables users to securely view and control another computer over the internet using live video streaming.
Unlike screenshot-based screen sharing, DeskBridge uses WebRTC to stream the desktop as a continuous, low-latency video feed, similar to professional tools like AnyDesk and TeamViewer.

## 🚀 Key Features

- 🔴 **Live Desktop Streaming** using WebRTC
- 🖱️ **Remote Mouse & Keyboard Control**
    - **Robust Mouse**: Normalized coordinates for resolution independence, positioned clicks, and scaled scrolling.
    - **Keyboard Support**: Full key mapping with modifier support (Ctrl, Shift, etc.).
    - **Access Control**: Host can instantly grant or revoke control permissions.
- 🔐 **Session-Based Authentication**
- ⚡ **Low-Latency Peer-to-Peer Communication** via Socket.IO
- 🖥️ **Cross-Platform Desktop App** (Windows, macOS, Linux)
- 🌗 **Light & Dark Mode UI**

## 🧠 Architecture

The system follows a **Controller (Guest) -> Server -> Host** scaling approach:

1.  **Controller (Guest)**: Captures mouse movements relative to the video feed. Coordinates are **normalized** (0.0 to 1.0) to be independent of screen resolution.
2.  **Transport**: Events are sent via **Socket.IO** (`control-action` event) instead of WebRTC DataChannels to ensure reliability for critical control inputs.
3.  **Host**: Receives the normalized coordinates and uses **RobotJS** (via Electron IPC) to move the system cursor and simulate keystrokes, scaling the 0-1 control data to the Host's actual screen resolution.
4.  **Security**: Control events are strictly permission-gated. The host's `isControlEnabled` state determines if actions are executed.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React |
| Backend | Node.js + Express |
| Realtime Signaling | WebSocket / Socket.IO |
| Streaming | WebRTC |
| Desktop App | Electron |
| Control Automation | @jitsi/robotjs |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/deskbridge.git
    cd deskbridge
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

1.  Start the backend (Signaling Server):
    ```bash
    npm run dev
    ```

2.  Start the Electron application:
    ```bash
    npm run electron:dev
    ```

## 🎮 Usage Guide

1.  **Start a Session**: Launch the app on two devices.
2.  **Connect**: Enter the Host's Device ID on the Controller machine.
3.  **Permissions**:
    -   **Important**: On macOS, the Host device must grant **Accessibility** permissions to the Electron app in System Settings for remote control to work.
4.  **Control**:
    -   The Guest can toggle mouse/keyboard control in the toolbar.
    -   Host can click the **Lock/Unlock** icon to instantly revoke or grant control access.
    -   Visual feedback (toasts and disabled buttons) keeps the Controller informed of their permission status.

## 🤝 Contributions
This is currently a learning project. Contributions, suggestions, and feedback are welcome!

## 📌 Disclaimer
DeskBridge is a learning and academic project and is not intended to replace commercial remote desktop software. The project prioritizes privacy and security during development but is provided as-is.