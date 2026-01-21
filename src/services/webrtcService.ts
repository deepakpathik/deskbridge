import { useSettingsStore } from '../store/useSettingsStore';

export class WebRTCService {
    private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;
    private onTrackCallback: ((stream: MediaStream) => void) | null = null;
    private localStream: MediaStream | null = null;
    private peerConnection: RTCPeerConnection | null = null;

    /**
     * Captures the system screen/audio stream.
     * In a browser/Electron environment, this triggers the OS screen picker.
     */
    public async startScreenShare(): Promise<MediaStream> {
        try {
            const { resolution, fps } = useSettingsStore.getState();

            // Parse resolution (e.g., "1920x1080")
            const [width, height] = resolution.split('x').map(Number);
            const frameRate = Number(fps);

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    width: width ? { ideal: width } : undefined,
                    height: height ? { ideal: height } : undefined,
                    frameRate: frameRate ? { ideal: frameRate } : undefined,
                },
                audio: false
            } as any);

            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }

    public stopScreenShare() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }

    public createPeerConnection(): RTCPeerConnection {
        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.onIceCandidateCallback?.(event.candidate);
            }
        };

        // Handle incoming tracks (Remote Stream)
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote track', event.streams);
            if (event.streams && event.streams[0]) {
                this.onTrackCallback?.(event.streams[0]);
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Peer connection state:', this.peerConnection?.connectionState);
        };

        return this.peerConnection;
    }

    public onTrack(callback: (stream: MediaStream) => void) {
        this.onTrackCallback = callback;
    }

    // Register callback for generated candidates
    public onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
        this.onIceCandidateCallback = callback;
    }

    // Handle incoming candidates from remote peer
    public async handleCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) {
            throw new Error('PeerConnection not initialized');
        }
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    public getPeerConnection(): RTCPeerConnection | null {
        return this.peerConnection;
    }


    public async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        // Add local stream tracks to PeerConnection
        if (this.localStream && this.peerConnection) {
            this.localStream.getTracks().forEach(track => {
                if (this.peerConnection && this.localStream) {
                    this.peerConnection.addTrack(track, this.localStream);
                }
            });
        }

        if (!this.peerConnection) {
            throw new Error('PeerConnection not initialized');
        }

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        if (!this.peerConnection) {
            throw new Error('PeerConnection not initialized');
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            throw new Error('PeerConnection not initialized');
        }
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    public getLocalStream(): MediaStream | null {
        return this.localStream;
    }
}

export const webrtcService = new WebRTCService();
