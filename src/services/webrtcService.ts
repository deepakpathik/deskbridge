export class WebRTCService {
    private localStream: MediaStream | null = null;
    private peerConnection: RTCPeerConnection | null = null;

    /**
     * Captures the system screen/audio stream.
     * In a browser/Electron environment, this triggers the OS screen picker.
     */
    public async startScreenShare(): Promise<MediaStream> {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                },
                audio: false // System audio capture support varies by OS
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

        // Debug logging for ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // We will handle emitting this via socket in a later step
                // console.log('New ICE candidate:', event.candidate); 
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Peer connection state:', this.peerConnection?.connectionState);
        };

        return this.peerConnection;
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
