import VoiceService from './VoiceService';
import haiMp3 from '../Responses/CuteResponse/hai.mp3';

class VoiceCommands {
  private voiceService = VoiceService;
  private haiSound: HTMLAudioElement;
  private isEnabled = false;

  constructor() {
    this.haiSound = new Audio(haiMp3);
    this.haiSound.preload = 'auto';
  }

  public enable(onComplete?: () => void): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    this.voiceService.startListening((command) => {
      if (command.includes('hello')) {
        this.playHaiResponse().finally(() => {
          onComplete?.();
        });
      }
    });
  }

  public disable(): void {
    if (!this.isEnabled) return;
    
    this.voiceService.stopListening();
    this.isEnabled = false;
  }

  private async playHaiResponse(): Promise<void> {
    try {
      // Reset audio and play
      this.haiSound.currentTime = 0;
      await this.haiSound.play();
      
      // Auto-disable after successful playback
      this.disable();
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  // Optional: Add status check
  public get status(): boolean {
    return this.isEnabled;
  }
}

export default new VoiceCommands();