import VoiceService from './VoiceService';
import helloMp3 from '../Responses/CuteResponse/hello1.mp3';
import haiMp3 from '../Responses/CuteResponse/hai.mp3';

class VoiceCommands {
  private voiceService = VoiceService;
  private responses = {
    hello: new Audio(haiMp3),
    default: new Audio(helloMp3)
  };
  private isActive = false;

  constructor() {
    Object.values(this.responses).forEach(audio => {
      audio.preload = 'auto';
    });
  }

  async start(): Promise<void> {
    if (this.isActive) return;
    
    try {
      await this.voiceService.startListening(this.handleCommand.bind(this));
      this.isActive = true;
      console.log("VoiceCommands started");
    } catch (error) {
      console.error("Failed to start:", error);
      throw error;
    }
  }

  stop(): void {
    if (!this.isActive) return;
    this.voiceService.stopListening();
    this.isActive = false;
    console.log("VoiceCommands stopped");
  }

  async playResponse(type: 'hello' | 'default'): Promise<void> {
    try {
      const audio = this.responses[type];
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Playback failed:", error);
    }
  }

  private handleCommand(command: string): void {
    const normalized = command.toLowerCase().trim();
    if (normalized.includes("hello")) {
      this.playResponse('hello');
    } else {
      this.playResponse('default');
    }
  }
}

export default new VoiceCommands();