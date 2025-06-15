import VoiceService from './VoiceService';
import helloMp3 from '../Responses/CuteResponse/hello1.mp3';
import haiMp3 from '../Responses/CuteResponse/hai.mp3';
import aboutMp3 from '../Responses/CuteResponse/about.mp3'; // Add your about response
import timeMp3 from '../Responses/CuteResponse/time.mp3'; // Add your time response

class VoiceCommands {
  private voiceService = VoiceService;
  private responses = {
    hello: new Audio(haiMp3),
    about: new Audio(aboutMp3),
    time: new Audio(timeMp3),
    default: new Audio(helloMp3)
  };

  constructor() {
    // Preload all audio files
    Object.values(this.responses).forEach(audio => {
      audio.preload = 'auto';
    });
  }

  start() {
    this.voiceService.startListening((command) => {
      this.handleCommand(command);
    });
  }

  stop() {
    this.voiceService.stopListening();
  }

  private async handleCommand(command: string) {
    try {
      if (command.includes("hello")) {
        await this.playResponse('hello');
      } 
      else if (command.includes("about")) { 
        await this.playResponse('about');
      }
      else if (command.includes("time")) {
        await this.playResponse('time');
      } else {
        await this.playResponse('default');
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  }

  private async playResponse(type: keyof typeof this.responses) {
    const audio = this.responses[type];
    audio.currentTime = 0; // Rewind if already played
    await audio.play();
  }
}

export default new VoiceCommands();