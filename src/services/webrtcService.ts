import { useSettingsStore } from '../store/useSettingsStore';

export class WebRTCService {
    private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;
    private onTrackCallback: ((stream: MediaStream) => void) | null = null;
    private localStream: MediaStream | null = null;
    private peerConnection: RTCPeerConnection | null = null;

    private dataChannel: RTCDataChannel | null = null;
    private onControlDataCallback: ((data: any) => void) | null = null;

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
                audio: true, // Request system audio
                systemAudio: "include" // Explicitly request system audio (Chrome/Electron)
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

    public cleanup() {
        this.stopScreenShare();
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        // Reset callbacks to prevent memory leaks if service instance persists
        this.onIceCandidateCallback = null;
        this.onTrackCallback = null;
        this.onControlDataCallback = null;
    }

    public createPeerConnection(): RTCPeerConnection {
        const configuration: RTCConfiguration = {
            iceServers: [
                // Google STUN servers (reliable)
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.onIceCandidateCallback?.(event.candidate);
                console.log('ICE candidate generated', event.candidate);
            }
        };

        // Handle incoming tracks (Remote Stream)
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote track', event.streams);
            if (event.streams && event.streams[0]) {
                this.onTrackCallback?.(event.streams[0]);
                console.log('Remote track received', event.streams[0]);
            }
        };

        // Handle Data Channel (Receiver/Host side)
        this.peerConnection.ondatachannel = (event) => {
            console.log('Received data channel');
            this.setupDataChannel(event.channel);
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Peer connection state:', this.peerConnection?.connectionState);
        };

        return this.peerConnection;
    }

    // Data Channel Logic
    private setupDataChannel(channel: RTCDataChannel) {
        this.dataChannel = channel;
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
        };
        this.dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.onControlDataCallback?.(data);
            console.log('Data received', data);
        };
    }

    public onControlData(callback: (data: any) => void) {
        this.onControlDataCallback = callback;
    }

    public sendControlData(data: any) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
        }
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


    public async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection || this.peerConnection.connectionState === 'closed' || this.peerConnection.signalingState === 'closed') {
            this.createPeerConnection();
        }

        // Create Data Channel (Caller/Guest side)
        if (this.peerConnection) {
            // Only create if it doesn't exist? Or just create a new one?
            // Usually only one side creates it.
            const channel = this.peerConnection.createDataChannel("control");
            this.setupDataChannel(channel);
        }

        // Add local stream tracks to PeerConnection
        if (this.localStream && this.peerConnection) {
            this.localStream.getTracks().forEach(track => {
                if (this.peerConnection && this.localStream) {
                    const senders = this.peerConnection.getSenders();
                    const alreadyAdded = senders.some(s => s.track === track);
                    if (!alreadyAdded) {
                        this.peerConnection.addTrack(track, this.localStream);
                    }
                }
            });
        }

        if (!this.peerConnection) {
            throw new Error('PeerConnection not initialized');
        }

        const offer = await this.peerConnection.createOffer(options);
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection || this.peerConnection.connectionState === 'closed' || this.peerConnection.signalingState === 'closed') {
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

        if (this.peerConnection.signalingState === 'stable') {
            console.warn('Received Answer but signaling state is already stable. Ignoring.');
            return;
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    public getLocalStream(): MediaStream | null {
        return this.localStream;
    }
}

export const webrtcService = new WebRTCService();
