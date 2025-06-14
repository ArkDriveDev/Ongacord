import VoiceService from './VoiceService';
import hello1Mp3 from '../Responses/CuteResponse/hello1.mp3'; // Feedback sound
import haiMp3 from '../Responses/CuteResponse/hai.mp3';

class VoiceCommands {
  private voiceService = VoiceService;
  private haiSound = new Audio(haiMp3);
  private feedbackSound = new Audio(hello1Mp3); // Audio to confirm listening
  private isEnabled = false;

  constructor() {
    this.haiSound.preload = 'auto';
    this.feedbackSound.preload = 'auto';
  }

  public async enable(): Promise<void> {
    if (this.isEnabled) return;

    try {
      // 1. First request mic permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Play feedback sound to confirm listening
      await this.playFeedback();
      
      // 3. Start listening with command handler
      this.voiceService.startListening((command) => {
        const normalizedCmd = command.toLowerCase().trim();
        if (normalizedCmd.includes('hello')) {
          this.playHaiResponse();
        }
      });
      
      this.isEnabled = true;
    } catch (err) {
      console.error("VoiceCommands failed:", err);
      this.disable();
    }
  }

  public disable(): void {
    this.voiceService.stopListening();
    this.isEnabled = false;
  }

  private async playFeedback(): Promise<void> {
    try {
      this.feedbackSound.currentTime = 0;
      await this.feedbackSound.play();
    } catch (err) {
      console.error("Feedback sound error:", err);
    }
  }

  private playHaiResponse(): void {
    this.haiSound.currentTime = 0;
    this.haiSound.play().catch(e => console.error("Hai sound error:", e));
  }
}

// Singleton instance
export default new VoiceCommands();