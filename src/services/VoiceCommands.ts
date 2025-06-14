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
    this.setupAudioErrorHandling();
  }

  public static getInstance(): VoiceCommands {
    if (!VoiceCommands.instance) {
      VoiceCommands.instance = new VoiceCommands();
    }
    return VoiceCommands.instance;
  }

  private setupAudioErrorHandling(): void {
    this.haiSound.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      throw new Error('Audio file failed to load');
    });
  }

  public async enable(onComplete?: () => void): Promise<void> {
    if (this.isEnabled) return;

    try {
      await this.ensureMicrophonePermission();
      
      this.isEnabled = true;
      this.recognitionActive = true;
      
      this.voiceService.startListening((command) => {
        if (!this.recognitionActive) return;
        
        console.log('Voice command detected:', command);
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
    if (!this.isEnabled) return;
    
    this.voiceService.stopListening();
    this.isEnabled = false;
    this.recognitionActive = false;
  }

  public async requestMicrophonePermission(): Promise<void> {
    if (this.permissionGranted) return;
    
    try {
      // Modern permission API (works in Chrome)
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ 
          name: 'microphone' as any 
        });
        
        if (permission.state === 'denied') {
          throw new Error('Microphone permission blocked. Please enable in browser settings.');
        }
      }

      // Legacy getUserMedia check (works in all browsers)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      this.permissionGranted = true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      throw new Error('Microphone access is required for voice commands. Please allow microphone access.');
    }
  }

  private async ensureMicrophonePermission(): Promise<void> {
    if (!this.permissionGranted) {
      await this.requestMicrophonePermission();
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
    this.isEnabled = false;
    this.recognitionActive = false;
    this.voiceService.stopListening();
  }

  public get status(): { isEnabled: boolean; permissionGranted: boolean } {
    return {
      isEnabled: this.isEnabled,
      permissionGranted: this.permissionGranted
    };
  }
}

// Export a singleton instance
export default VoiceCommands.getInstance();