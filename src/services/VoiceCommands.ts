import VoiceService from './VoiceService';
import haiMp3 from '../Responses/CuteResponse/hai.mp3';

class VoiceCommands {
  private voiceService = VoiceService;
  private haiSound = new Audio(haiMp3);

  constructor() {
    this.setupCommands();
  }

  private setupCommands() {
    this.voiceService.startListening((command) => {
      if (command.includes('onga')) {
        this.playHaiResponse();
      }
    });
  }

  private playHaiResponse() {
    this.haiSound.currentTime = 0; // Reset if already playing
    this.haiSound.play().catch(e => console.error("Audio play failed:", e));
  }

  // Public methods
  public enable() {
    this.voiceService.startListening(() => {});
  }

  public disable() {
    this.voiceService.stopListening();
  }
}

export default new VoiceCommands();