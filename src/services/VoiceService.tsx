import { SpeechRecognition } from '@capacitor-community/speech-recognition';

class VoiceService {
  private isListening = false;

  async init(): Promise<boolean> {
    try {
      // 1. Check availability
      const { available } = await SpeechRecognition.available();
      if (!available) {
        console.warn("Speech recognition not available on this device");
        return false;
      }

      // 2. Handle permissions
      const hasPermission = await this.checkAndRequestPermissions();
      if (!hasPermission) {
        console.warn("Microphone permission denied");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Initialization error:", error);
      return false;
    }
  }

  private async checkAndRequestPermissions(): Promise<boolean> {
    try {
      const status = await SpeechRecognition.checkPermissions();
      
      if (status.speechRecognition !== 'granted') {
        const requestStatus = await SpeechRecognition.requestPermissions();
        return requestStatus.speechRecognition === 'granted';
      }
      return true;
    } catch (error) {
      console.error("Permission error:", error);
      return false;
    }
  }

  async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (this.isListening) return false;

    try {
      await SpeechRecognition.start({
        language: "en-US",
        partialResults: true,
        popup: false,
      });

      // Correct event listener with proper typing
      SpeechRecognition.addListener("partialResults", (data: {matches?: string[]}) => {
        if (data?.matches && data.matches.length > 0) {
          const transcript = data.matches[0];
          onResult(transcript.toLowerCase().trim());
        }
      });

      this.isListening = true;
      return true;
    } catch (error) {
      console.error("Start listening error:", error);
      return false;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;
    
    try {
      await SpeechRecognition.stop();
      SpeechRecognition.removeAllListeners();
      this.isListening = false;
    } catch (error) {
      console.error("Stop listening error:", error);
    }
  }
}

export default new VoiceService();