declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private systemAudioPlaying = false;
  private onResultCallback: ((command: string) => void) | null = null;
  private cooldownTimeout: number | null = null;
  private readonly COOLDOWN_MS = 1500;
  private restartAttempts = 0;
  private readonly MAX_RESTART_ATTEMPTS = 3;
  private isRestarting = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecog) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecog();
    this.recognition.continuous = false; // Changed from true to false
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (this.shouldIgnoreInput()) return;
      const results = event.results[event.results.length - 1];
      if (results.isFinal) {
        const transcript = results[0].transcript.trim();
        this.onResultCallback?.(transcript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const ignorableErrors = ['no-speech', 'audio-capture'];
      if (!ignorableErrors.includes(event.error)) {
        console.error("Recognition error:", event.error);
      }
      this.safeStop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  private shouldIgnoreInput(): boolean {
    return this.isSpeaking || this.systemAudioPlaying;
  }

  private safeStop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      this.isListening = false;
    }
  }

  public async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition || this.isListening) return false;

    this.onResultCallback = onResult;
    this.isListening = true;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Failed to start listening:", error);
      this.isListening = false;
      return false;
    }
  }

  public stopListening(): void {
    this.safeStop();
    this.onResultCallback = null;
  }

  public setSpeakingState(speaking: boolean): void {
    this.isSpeaking = speaking;
  }

  public setSystemAudioState(playing: boolean): void {
    this.systemAudioPlaying = playing;
  }
}

export default new VoiceService();