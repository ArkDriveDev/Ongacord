class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private onResultCallback: ((command: string) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Always keep listening
    this.recognition.interimResults = false; // Only final results
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal && !this.isSpeaking) { // Only process if not speaking
        const transcript = result[0].transcript.trim().toLowerCase();
        this.onResultCallback?.(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Recognition error:", (event as SpeechRecognitionErrorEvent).error);
      this.safeRestart(); // Auto-restart on error
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.safeRestart(); // Auto-restart if still active
      }
    };
  }

  private safeRestart(): void {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.start();
      }
    } catch (error) {
      console.warn("Restart error:", error);
      setTimeout(() => this.safeRestart(), 1000); // Retry after delay
    }
  }

  public async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition || this.isListening) return false;

    this.onResultCallback = onResult;
    this.isListening = true;
    this.safeRestart(); // Start listening
    return true;
  }

  public stopListening(): void {
    this.isListening = false;
    this.onResultCallback = null;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public setSpeakingState(speaking: boolean): void {
    this.isSpeaking = speaking;
    if (!speaking && this.isListening) {
      this.safeRestart(); // Resume listening when done speaking
    }
  }
}

export default new VoiceService();