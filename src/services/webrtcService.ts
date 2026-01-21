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
            });

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

    public getLocalStream(): MediaStream | null {
        return this.localStream;
    }
}

export const webrtcService = new WebRTCService();
