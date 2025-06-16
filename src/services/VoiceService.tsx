class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private onResultCallback: ((command: string) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      this.handleRecognitionResult(transcript.toLowerCase());
    };

    this.recognition.onerror = (event) => {
      console.error("Recognition error:", (event as SpeechRecognitionErrorEvent).error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.isSpeaking) {
        this.safeRestart();
      }
    };
  }

  private handleRecognitionResult(transcript: string) {
    this.pauseListening();
    this.onResultCallback?.(transcript);
  }

  private safeRestart() {
    try {
      if (this.recognition && !this.isSpeaking) {
        this.recognition.start();
      }
    } catch (error) {
      console.error("Restart error:", error);
      setTimeout(() => this.safeRestart(), 500);
    }
  }

  async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition || this.isListening) return false;

    this.onResultCallback = onResult;
    this.isListening = true;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Start error:", error);
      this.isListening = false;
      return false;
    }
  }

  pauseListening() {
    this.isListening = false;
    this.recognition?.stop();
  }

  resumeListening() {
    if (!this.isSpeaking && this.onResultCallback) {
      this.startListening(this.onResultCallback);
    }
  }

  stopListening() {
    this.isListening = false;
    this.onResultCallback = null;
    this.recognition?.stop();
  }

  setSpeakingState(speaking: boolean) {
    this.isSpeaking = speaking;
    if (!speaking && this.onResultCallback) {
      this.resumeListening();
    }
  }
}

export default new VoiceService();