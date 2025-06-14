import VoiceService from './VoiceService';
import haiMp3 from '../Responses/CuteResponse/hai.mp3';

class VoiceCommands {
  private static instance: VoiceCommands;
  private voiceService = VoiceService;
  private haiSound: HTMLAudioElement;
  private isEnabled = false;
  private permissionGranted = false;
  private recognitionActive = false;
  private mediaStream: MediaStream | null = null; // Store the stream

  private constructor() {
    this.haiSound = new Audio(haiMp3);
    this.haiSound.preload = 'auto';
  }

  public static getInstance(): VoiceCommands {
    if (!VoiceCommands.instance) {
      VoiceCommands.instance = new VoiceCommands();
    }
    return VoiceCommands.instance;
  }

  public async enable(onComplete?: () => void): Promise<void> {
    if (this.isEnabled) return;

    try {
      // Request permission when enabling
      await this.requestMicrophonePermission();
      
      this.isEnabled = true;
      this.recognitionActive = true;
      
      this.voiceService.startListening((command) => {
        if (!this.recognitionActive) return;
        
        const normalizedCmd = command.toLowerCase().trim();
        if (normalizedCmd.includes('hello')) {
          this.playHaiResponse().finally(() => {
            this.recognitionActive = false;
            onComplete?.();
          });
        }
      });
    } catch (error) {
      this.cleanupOnError();
      throw error;
    }
  }

  public disable(): void {
    this.voiceService.stopListening();
    // Don't stop the media stream here to maintain permission
    this.isEnabled = false;
    this.recognitionActive = false;
  }

  public async requestMicrophonePermission(): Promise<void> {
    if (this.permissionGranted) return;
    
    try {
      // Keep a reference to the stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.permissionGranted = true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      throw new Error('Please allow microphone access to use voice commands');
    }
  }

  private async playHaiResponse(): Promise<void> {
    try {
      this.haiSound.currentTime = 0;
      await this.haiSound.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw new Error('Could not play audio response');
    }
  }

  private cleanupOnError(): void {
    this.disable();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  public get status() {
    return {
      isEnabled: this.isEnabled,
      permissionGranted: this.permissionGranted
    };
  }

  // Add a method to properly clean up when done
  public async shutdown(): Promise<void> {
    this.disable();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.permissionGranted = false;
  }
}

export default VoiceCommands.getInstance();