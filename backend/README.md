# DeskBridge Backend

This directory contains the server-side logic for DeskBridge, powered by Node.js, Express, and Socket.IO.

## Structure

- **index.js**: Entry point. Initializes the Express server and Socket.IO instance.
- **handlers/**: Contains modular event handlers for Socket.IO.
  - **socketHandler.js**: Manages general socket events (join room, disconnect).
  - **webrtcHandler.js**: Manages WebRTC signaling events (offer, answer, ice-candidate).

## distinct from Frontend Services
Note that `src/services/socketService.ts` and `src/services/webrtcService.ts` are **client-side** services that run in the Electron/React application. They communicate with this backend but are part of the frontend codebase.
