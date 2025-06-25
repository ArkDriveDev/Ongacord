class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private onResultCallback: ((command: string) => void) | null = null;
  private restartTimeout: number | null = null;
  
  // Mobile-specific settings
  private readonly MOBILE_SILENCE_THRESHOLD = 3000; // 3 seconds delay before restarting on silence
  private readonly DESKTOP_SILENCE_THRESHOLD = 500; // Shorter delay for desktop
  private readonly MIN_LISTENING_DURATION = 5000; // Minimum 5s listening session

  constructor() {
    this.initRecognition();
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private initRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = this.isMobile(); // Critical for mobile!
    this.recognition.lang = "en-US";

    // Mobile-specific optimizations
    if (this.isMobile() && 'webkitSpeechRecognition' in window) {
      (this.recognition as any).stopTimeout = this.MIN_LISTENING_DURATION;
    }

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript.trim();
        this.handleRecognitionResult(transcript.toLowerCase());
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Recognition error:", (event as SpeechRecognitionErrorEvent).error);
      this.scheduleRestart();
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.isSpeaking) {
        this.scheduleRestart();
      }
    };
  }

  private scheduleRestart(): void {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }

    // Use longer delays on mobile
    const delay = this.isMobile() ? this.MOBILE_SILENCE_THRESHOLD : this.DESKTOP_SILENCE_THRESHOLD;
    
    this.restartTimeout = window.setTimeout(() => {
      if (this.isListening && !this.isSpeaking) {
        this.safeStart();
      }
    }, delay);
  }

  private safeStart(): void {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.start();
        console.log("Recognition restarted");
      }
    } catch (error) {
      console.warn("Restart error:", error);
      this.scheduleRestart(); // Retry on failure
    }
  }

  private handleRecognitionResult(transcript: string): void {
    if (this.isSpeaking) return; // Ignore results while speaking
    
    // Mobile-specific: ignore very short transcripts (noise)
    if (this.isMobile() && transcript.length < 3) return;
    
    this.onResultCallback?.(transcript);
  }

  public async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition || this.isListening) return false;

    this.onResultCallback = onResult;
    this.isListening = true;
    this.safeStart();
    return true;
  }

  public stopListening(): void {
    this.isListening = false;
    this.onResultCallback = null;
    
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public setSpeakingState(speaking: boolean): void {
    this.isSpeaking = speaking;
    
    // Auto-restart if stopping speech and listening is active
    if (!speaking && this.isListening) {
      this.scheduleRestart();
    }
  }
}

// Singleton export
export default new VoiceService();