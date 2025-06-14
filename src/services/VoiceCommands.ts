import VoiceService from './VoiceService';
import haiMp3 from '../Responses/CuteResponse/hai.mp3';

class VoiceCommands {
  private static instance: VoiceCommands;
  private voiceService = VoiceService;
  private haiSound: HTMLAudioElement;
  private isEnabled = false;
  private permissionGranted = false;
  private recognitionActive = false;

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
      // Request permission only when enabling
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
    this.isEnabled = false;
    this.recognitionActive = false;
  }

  public async requestMicrophonePermission(): Promise<void> {
    if (this.permissionGranted) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the stream - we just needed permission
      stream.getTracks().forEach(track => track.stop());
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
  }

  public get status() {
    return {
      isEnabled: this.isEnabled,
      permissionGranted: this.permissionGranted
    };
  }
}

export default VoiceCommands.getInstance();