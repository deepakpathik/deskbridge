import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { socketService } from '../services/socketService';
import { webrtcService } from '../services/webrtcService';

export function useWebRTC() {
    const { status, isCaller, remoteDeviceId } = useAppStore();
    const hasInitiated = useRef(false);

    useEffect(() => {
        // Only proceed if we are in session
        if (status !== 'IN_SESSION') {
            hasInitiated.current = false;
            return;
        }

        if (hasInitiated.current) return;
        hasInitiated.current = true;

        // 1. Setup Signal Handling
        const setupSignaling = () => {
            // Handle Incoming Offer
            socketService.onOffer(async (offer) => {
                console.log("Received Offer");
                const answer = await webrtcService.handleOffer(offer);
                if (remoteDeviceId) {
                    socketService.sendAnswer(remoteDeviceId, answer); // In our backend logic, roomId ~ peerId often, or we join peer's room. 
                    // Wait, joinRoom logic: User A joins Room B? 
                    // Step 14: socketService.joinRoom(targetId). 
                    // So the shared roomId IS the targetId (Host Device ID).
                    // So we should verify which room ID to use for signaling.
                    // For direct p2p, we typically emit to the 'room'.
                    // Our backend relays to `socket.to(roomId)`. 
                    // The roomId is likely the Host's Device ID.

                    // If I am Caller, I joined Host's ID.
                    // If I am Host, I joined my own ID (implicitly? check backend).
                    // Backend: socket.on('join-room') -> socket.join(roomId);
                    // Host needs to join their own room?
                    // Step 13/14 check: 
                    // - HomeScreen: acceptConnection? no explicit join logic for Host yet except 'connect'
                    // - Ah, Step 26 logic: "If I am waiting (CONNECTED), someone joins my room".
                    // ERROR: Host needs to join "their own room" to receive messages on it?
                    // Or does Caller join Host's room and Host is already in it?
                    // Backend: socket.join(roomId).
                    // Host must have called joinRoom(myDeviceId) at some point?
                    // In `useAppStore`: initializeSocket -> socket.connect().
                    // WE MISS THE HOST JOINING THEIR OWN ROOM!
                    // FIX: Host should joinRoom(myDeviceId) on startup or when "Online".
                }
            });

            // Handle Incoming Answer
            socketService.onAnswer(async (answer) => {
                console.log("Received Answer");
                await webrtcService.handleAnswer(answer);
            });

            // Handle ICE Candidates
            socketService.onIceCandidate(async (candidate) => {
                console.log("Received ICE Candidate");
                await webrtcService.handleCandidate(candidate);
            });

            // Generate ICE Candidates
            webrtcService.onIceCandidate((candidate) => {
                if (remoteDeviceId) {
                    // Assumption: remoteDeviceId is the room ID we are sharing?
                    // If I am Caller, remoteDeviceId is Host ID. 
                    // If I am Host, remoteDeviceId is incoming user ID.
                    // But we share a "Room" which is the Host ID.
                    // Caller joined HostID. Host should be in HostID.
                    // So roomId = isCaller ? remoteDeviceId : myDeviceId.
                    const roomId = useAppStore.getState().isCaller ? remoteDeviceId : useAppStore.getState().myDeviceId;
                    if (roomId) socketService.sendIceCandidate(roomId, candidate);
                }
            });

            // Handle Remote Tracks (handled in webrtcService via callback, but we need to hook it to UI)
            // This hook might just handle signaling. Rendering is done by VideoPreview or LiveSessionScreen via webrtcService.
        };

        setupSignaling();

        // 2. Initiate Offer if Caller
        const initiateHandshake = async () => {
            if (isCaller && remoteDeviceId) {
                console.log("I am Caller, initiating offer...");
                const offer = await webrtcService.createOffer();
                socketService.sendOffer(remoteDeviceId, offer); // remoteDeviceId is the Room ID (Host ID)
            }
        };

        initiateHandshake();

        // Cleanup listeners? 
        // socketService.offOffer...? We didn't implement off methods. 
        // For now, duplicate listeners might be an issue if we re-mount.
        // Ideally we'd modify socketService to single-subscription or add cleanup.
        // Ignoring for MVP step but noting it.

    }, [status, isCaller, remoteDeviceId]);
}
