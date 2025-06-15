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
    this.recognition.continuous = true; // Keep listening
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", transcript); // Debug log
      this.resultCallback?.(transcript);
    };

    this.recognition.onerror = (event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.error("Recognition error:", errorEvent.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      console.log("Recognition session ended");
      if (this.isListening) {
        this.recognition?.start(); // Auto-restart
      }
    };
  }

  async startListening(onResult: (command: string) => void): Promise<void> {
    if (!this.recognition || this.isListening) return;

    try {
      // Verify mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release mic
      
      this.resultCallback = onResult;
      this.isListening = true;
      this.recognition.start();
      console.log("Started listening");
    } catch (err) {
      console.error("Mic access failed:", err);
      throw err;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      this.resultCallback = null;
      console.log("Stopped listening");
    }
  }
}

export default new VoiceService();