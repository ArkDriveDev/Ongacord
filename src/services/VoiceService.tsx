class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private resultCallback: ((command: string) => void) | null = null;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Changed to continuous mode
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    // Event handlers
    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Recognized:", transcript); // Debug log
      if (this.resultCallback) {
        this.resultCallback(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.error("Recognition error:", errorEvent.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      console.log("Recognition ended"); // Debug log
      if (this.isListening) {
        // Auto-restart if still in listening mode
        this.recognition?.start();
      }
    };
  }

  async startListening(onResult: (command: string) => void): Promise<void> {
    if (!this.recognition || this.isListening) return;

    try {
      // Check microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release immediately
      
      this.resultCallback = onResult;
      this.isListening = true;
      this.recognition.start();
      console.log("Started listening"); // Debug log
    } catch (err) {
      console.error("Microphone access failed:", err);
      throw new Error("MICROPHONE_ACCESS_DENIED");
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      this.resultCallback = null;
      console.log("Stopped listening"); // Debug log
    }
  }
}

export default new VoiceService();