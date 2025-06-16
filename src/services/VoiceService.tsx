class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private onResultCallback: ((command: string) => void) | null = null;
  private restartTimeout: number | null = null;

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
    this.recognition.continuous = true; // Crucial for continuous listening
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      this.handleRecognitionResult(transcript.toLowerCase());
    };

    this.recognition.onerror = (event) => {
      console.error("Recognition error:", (event as SpeechRecognitionErrorEvent).error);
      this.scheduleRestart(); // Restart on errors
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.isSpeaking) {
        this.scheduleRestart(); // Auto-restart when stopped
      }
    };
  }

  private scheduleRestart() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    this.restartTimeout = window.setTimeout(() => {
      if (this.isListening && !this.isSpeaking) {
        this.safeStart();
      }
    }, 300); // Short delay before restarting
  }

  private safeStart() {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.start();
      }
    } catch (error) {
      console.warn("Restart error - retrying:", error);
      this.scheduleRestart();
    }
  }

  private handleRecognitionResult(transcript: string) {
    this.onResultCallback?.(transcript);
  }

  async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition || this.isListening) return false;

    this.onResultCallback = onResult;
    this.isListening = true;
    this.safeStart();
    return true;
  }

  stopListening() {
    this.isListening = false;
    this.onResultCallback = null;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    this.recognition?.stop();
  }

  setSpeakingState(speaking: boolean) {
    this.isSpeaking = speaking;
  }
}

export default new VoiceService();