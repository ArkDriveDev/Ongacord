class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private onResultCallback: ((command: string) => void) | null = null;
  private cooldownTimeout: number | null = null;
  private readonly COOLDOWN_MS = 1500; // 1.5s buffer after audio

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
    this.recognition.continuous = true; // Critical for always-on
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      if (this.isSpeaking) return; // Ignore results during playback

      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript.trim().toLowerCase();
        console.log("Processed command:", transcript); // Debug
        this.onResultCallback?.(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Recognition error:", (event as SpeechRecognitionErrorEvent).error);
      this.safeRestart(); // Auto-recover
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.isSpeaking) {
        this.safeRestart(); // Silence-proof restart
      }
    };
  }

  private safeRestart(): void {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.start();
        console.log("Mic restarted");
      }
    } catch (error) {
      console.warn("Restart failed, retrying...", error);
      setTimeout(() => this.safeRestart(), 1000); // Retry after delay
    }
  }

  public async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition) return false;

    this.onResultCallback = onResult;
    this.isListening = true;
    this.safeRestart(); // Start immediately
    return true;
  }

  public stopListening(): void {
    this.isListening = false;
    this.onResultCallback = null;
    if (this.cooldownTimeout) clearTimeout(this.cooldownTimeout);
    if (this.recognition) this.recognition.stop();
  }

  public setSpeakingState(speaking: boolean): void {
    this.isSpeaking = speaking;

    if (speaking) {
      // Immediate mic shutdown for playback
      if (this.cooldownTimeout) clearTimeout(this.cooldownTimeout);
      if (this.recognition) this.recognition.stop();
    } else {
      // Delayed restart to avoid audio feedback
      this.cooldownTimeout = window.setTimeout(() => {
        if (this.isListening && !this.isSpeaking) {
          this.safeRestart();
        }
      }, this.COOLDOWN_MS);
    }
  }
}

// Singleton export
export default new VoiceService();