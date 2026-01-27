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

        const handleOffer = async (offer: RTCSessionDescriptionInit) => {
            console.log("Received Offer");
            const answer = await webrtcService.handleOffer(offer);
            if (remoteDeviceId) {
                socketService.sendAnswer(remoteDeviceId, answer);
            }
        };

        const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
            console.log("Received Answer");
            await webrtcService.handleAnswer(answer);
        };

        const handleIceCandidate = async (candidate: RTCIceCandidate) => {
            console.log("Received ICE Candidate");
            await webrtcService.handleCandidate(candidate);
        };

        const setupSignaling = () => {
            socketService.onOffer(handleOffer);
            socketService.onAnswer(handleAnswer);
            socketService.onIceCandidate(handleIceCandidate);

            webrtcService.onIceCandidate((candidate) => {
                if (remoteDeviceId) {
                    const roomId = useAppStore.getState().isCaller ? remoteDeviceId : useAppStore.getState().myDeviceId;
                    if (roomId) socketService.sendIceCandidate(roomId, candidate);
                }
            });

            return () => {
                socketService.offOffer(handleOffer);
                socketService.offAnswer(handleAnswer);
                socketService.offIceCandidate(handleIceCandidate);
            };
        };

        const cleanupSignaling = setupSignaling();

        const initiateHandshake = async () => {
            if (isCaller && remoteDeviceId) {
                console.log("Initiating WebRTC offer as Caller...");
                const offer = await webrtcService.createOffer();
                socketService.sendOffer(remoteDeviceId, offer);
            }
        };

        initiateHandshake();

        return () => {
            cleanupSignaling();
            hasInitiated.current = false;
        };
    }, [status, isCaller, remoteDeviceId]);
}
