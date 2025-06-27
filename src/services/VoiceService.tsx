// VoiceService.ts - Final Clean Version
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    webkitAudioContext: typeof AudioContext;
  }
}

type RecognitionState = 'inactive' | 'running' | 'paused';

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private systemAudioPlaying = false;
  private onResultCallback: ((command: string) => void) | null = null;
  private cooldownTimeout: number | null = null;
  private readonly COOLDOWN_MS = 1500;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initRecognition();
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    } catch (e) {
      console.warn("AudioContext not supported:", e);
    }
  }

  private initRecognition(): void {
    const SpeechRecog = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecog) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecog();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onaudiostart = () => {
      this.applyAudioConstraints();
    };

    this.recognition.onresult = (event: any) => {
      if (this.shouldIgnoreInput()) return;
      const results = event.results[event.results.length - 1];
      if (results.isFinal) {
        const transcript = results[0].transcript.trim().toLowerCase();
        console.log("Processed command:", transcript);
        this.onResultCallback?.(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      this.safeRestart();
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.shouldIgnoreInput()) {
        this.safeRestart();
      }
    };
  }

   private applyAudioConstraints(): void {
    try {
      const stream = (this.recognition as any).stream;
      if (stream) {
        const tracks = stream.getAudioTracks();
        tracks.forEach((track: MediaStreamTrack) => {
          track.applyConstraints({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }).catch((e: Error) => console.warn("Audio constraints error:", e));
        });
      }
    } catch (e) {
      console.warn("Audio constraints failed:", e);
    }
  }

  private shouldIgnoreInput(): boolean {
    return this.isSpeaking || this.systemAudioPlaying;
  }

  private safeRestart(): void {
    try {
      if (this.recognition && this.isListening && !this.shouldIgnoreInput()) {
        this.recognition.start();
        console.log("Mic restarted");
      }
    } catch (error) {
      console.warn("Restart failed, retrying...", error);
      setTimeout(() => this.safeRestart(), 1000);
    }
  }

  public async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition) return false;
    this.onResultCallback = onResult;
    this.isListening = true;
    this.safeRestart();
    return true;
  }

  public stopListening(): void {
    this.isListening = false;
    this.onResultCallback = null;
    if (this.cooldownTimeout) {
      clearTimeout(this.cooldownTimeout);
      this.cooldownTimeout = null;
    }
    if (this.recognition) this.recognition.stop();
  }

  public setSpeakingState(speaking: boolean): void {
    if (this.isSpeaking === speaking) return;
    this.isSpeaking = speaking;
    this.handleAudioStateChange();
  }

  public setSystemAudioState(playing: boolean): void {
    if (this.systemAudioPlaying === playing) return;
    this.systemAudioPlaying = playing;
    this.handleAudioStateChange();
  }

  private handleAudioStateChange(): void {
    if (this.shouldIgnoreInput()) {
      if (this.cooldownTimeout) {
        clearTimeout(this.cooldownTimeout);
        this.cooldownTimeout = null;
      }
      if (this.recognition) this.recognition.stop();
    } else if (this.isListening) {
      if (this.cooldownTimeout) clearTimeout(this.cooldownTimeout);
      this.cooldownTimeout = window.setTimeout(() => {
        if (this.isListening && !this.shouldIgnoreInput()) {
          this.safeRestart();
        }
      }, this.COOLDOWN_MS);
    }
  }

  public getState() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      systemAudioPlaying: this.systemAudioPlaying,
      recognitionActive: (this.recognition as any)?.state as RecognitionState | undefined
    };
  }
}

export default new VoiceService();