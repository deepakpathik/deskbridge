import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { socketService } from '../services/socketService';
import { webrtcService } from '../services/webrtcService';

export function useWebRTC() {
    const { status, isCaller, remoteDeviceId } = useAppStore();
    const hasInitiated = useRef(false);

    useEffect(() => {
        if (status !== 'IN_SESSION') {
            hasInitiated.current = false;
            return;
        }

        if (hasInitiated.current) return;
        hasInitiated.current = true;

        const setupSignaling = () => {
            socketService.onOffer(async (offer) => {
                console.log("Received Offer");
                const answer = await webrtcService.handleOffer(offer);
                if (remoteDeviceId) {
                    socketService.sendAnswer(remoteDeviceId, answer);
                }
            });

            socketService.onAnswer(async (answer) => {
                console.log("Received Answer");
                await webrtcService.handleAnswer(answer);
            });

            socketService.onIceCandidate(async (candidate) => {
                console.log("Received ICE Candidate");
                await webrtcService.handleCandidate(candidate);
            });

            webrtcService.onIceCandidate((candidate) => {
                if (remoteDeviceId) {
                    const roomId = useAppStore.getState().isCaller ? remoteDeviceId : useAppStore.getState().myDeviceId;
                    if (roomId) socketService.sendIceCandidate(roomId, candidate);
                }
            });
        };

        setupSignaling();

        const initiateHandshake = async () => {
            if (isCaller && remoteDeviceId) {
                console.log("Initiating WebRTC offer as Caller...");
                const offer = await webrtcService.createOffer();
                socketService.sendOffer(remoteDeviceId, offer);
            }
        };

        initiateHandshake();

    }, [status, isCaller, remoteDeviceId]);
}
