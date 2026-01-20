# 🖥️ DeskBridge

DeskBridge is a real-time remote desktop application that enables users to securely view and control another computer over the internet using live video streaming.
Unlike screenshot-based screen sharing, DeskBridge uses WebRTC to stream the desktop as a continuous, low-latency video feed, similar to professional tools like AnyDesk and TeamViewer.

# DeskBridge UI Design

## 🚀 Project Idea
This is a code bundle for DeskBridge UI Design. The original project is available at [Figma Design](https://www.figma.com/design/kEcPFbmLyAWP4P7jHx2sPy/DeskBridge-UI-Design).

The core idea behind DeskBridge is to build a lightweight, low-latency remote desktop system that works across platforms and focuses on:
- Live desktop streaming (not screenshots)
- Real-time mouse and keyboard control
- Secure, session-based connections
- Simple and clean user experience

This project is being developed as a learning-focused system-level application to explore real-time communication, networking, and desktop application development.

## ✨ Key Features
- 🔴 **Live Desktop Streaming** using WebRTC
- 🖱️ **Remote Mouse & Keyboard Control**
- 🔐 **Session-Based Authentication**
- ⚡ **Low-Latency Peer-to-Peer Communication**
- 🖥️ **Cross-Platform Desktop App** (Windows, macOS, Linux)
- 🌗 **Light & Dark Mode UI**

## 🧠 How It Works (High-Level)
1. The host machine captures its desktop as a media stream.
2. The stream is encoded and transmitted in real time using WebRTC.
3. A signaling server is used to establish peer-to-peer connections.
4. The controller machine receives and displays the live video feed.
5. Mouse and keyboard events are sent back to the host via a real-time control channel.

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React |
| Backend | Node.js + Express |
| Realtime Signaling | WebSocket / Socket.IO |
| Streaming | WebRTC |
| Desktop App | Electron |
| Security | DTLS + SRTP |

### 🗂️ Planned Architecture
```
Controller App  <─── WebRTC ───>  Host App
       │                              │
       └────── Signaling Server ──────┘
```

## 🎯 Project Goals
- Understand WebRTC and real-time media streaming
- Learn signaling and peer-to-peer networking
- Handle remote input events securely
- Build a production-style desktop application
- Gain hands-on experience with system design

## 🛠️ Current Status
🚧 **Work in Progress**

Initial focus is on:
- Setting up signaling server
- Establishing live screen streaming
- Building basic desktop UI

## 📌 Disclaimer
DeskBridge is a learning and academic project and is not intended to replace commercial remote desktop software.
The project does not collect user data and prioritizes privacy and security during development.

## 🤝 Contributions
This is currently a solo project. Contributions, suggestions, and feedback are welcome in the future.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.