import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, useIonRouter,
  isPlatform
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';
import hai from '../Responses/CuteResponse/hai.mp3';

interface ModelData {
  id: number;
  name: string;
  src: string;
}

interface LocationState {
  model: ModelData;
}

let globalSelectedModel: ModelData | null = null;

const DEFAULT_MODEL = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<LocationState>();
  const navigation = useIonRouter();
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(globalSelectedModel || DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(!isPlatform('mobile'));
  const haiSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    haiSound.current = new Audio(hai);
    haiSound.current.volume = 0.8;
    haiSound.current.preload = 'auto';

    return () => {
      if (haiSound.current) {
        haiSound.current.pause();
        haiSound.current = null;
      }
    };
  }, []);

  const playHaiSound = () => {
    if (!audioEnabled || !haiSound.current) return;
    
    haiSound.current.currentTime = 0;
    haiSound.current.play()
      .catch(e => console.log("Hai sound blocked:", e));
  };

  const handleVoiceCommand = (command: string) => {
    CommandList(command, navigation);
  };

  // Initialize voice with user gesture on mobile
  const enableVoiceSystem = () => {
    // Unlock audio on iOS
    const silentAudio = new Audio();
    silentAudio.volume = 0;
    silentAudio.play()
      .then(() => {
        setAudioEnabled(true);
        initializeVoice();
        playHaiSound();
      })
      .catch(e => console.log("Audio unlock failed:", e));
  };

  const initializeVoice = async () => {
  try {
    await VoiceService.startListening(handleVoiceCommand);
    setIsVoiceActive(true);
    setPermissionGranted(true);
    
    // Only play hai.mp3 if we're not on mobile or audio is already enabled
    if (!isPlatform('mobile') || audioEnabled) {
      playHaiSound();
    }
  } catch (error) {
    console.error("Voice initialization error:", error);
    setIsVoiceActive(false);
    
    // Specific error handling
    if (error instanceof Error) {
      switch(error.name) {
        case 'NotAllowedError':
          console.warn("Microphone permission denied");
          setPermissionGranted(false);
          break;
        case 'NetworkError':
          console.warn("Network connectivity issue");
          break;
        case 'NotSupportedError':
          console.warn("Browser doesn't support speech recognition");
          break;
        default:
          console.warn("Unknown voice error:", error);
      }
    }
  }
};

  // Auto-init on desktop
  useEffect(() => {
    if (!isPlatform('mobile')) {
      initializeVoice();
      playHaiSound();
    }
  }, []);

  // Handle model changes
  useEffect(() => {
    if (location.state?.model) {
      globalSelectedModel = location.state.model;
      setSelectedModel(location.state.model);
    } else if (!globalSelectedModel) {
      globalSelectedModel = DEFAULT_MODEL;
      setSelectedModel(DEFAULT_MODEL);
    }
  }, [location.state]);

  if (!selectedModel) {
    return <LoadingView />;
  }

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      {/* Mobile activation overlay */}
      {isPlatform('mobile') && !audioEnabled && (
        <div className="mobile-activation-overlay">
          <h2>Voice System Activation</h2>
          <p>Tap below to enable voice commands</p>
          <button onClick={enableVoiceSystem}>
            Enable Voice System
          </button>
        </div>
      )}

      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
          <VoiceStatusIndicator 
            isActive={isVoiceActive} 
            isMobile={isPlatform('mobile')}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <HologramDisplay model={selectedModel} />
        {!permissionGranted && <MicrophonePermissionPrompt />}
      </IonContent>
    </IonPage>
  );
};

// Helper Components
const LoadingView = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/models" text="Back" />
        </IonButtons>
        <IonTitle>Loading...</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h3>Loading hologram viewer</h3>
      </div>
    </IonContent>
  </IonPage>
);

const VoiceStatusIndicator = ({ isActive, isMobile }: { isActive: boolean, isMobile: boolean }) => (
  <div slot="end" style={{ 
    color: isActive ? '#4CAF50' : '#ccc',
    padding: '0 16px',
    fontSize: '0.8rem'
  }}>
    {isMobile ? (isActive ? 'ON' : 'OFF') : (isActive ? 'Active' : 'Inactive')}
  </div>
);

const HologramDisplay = ({ model }: { model: ModelData }) => (
  <div className="hologram-center">
    <div className="reflection-base">
      {['top', 'right', 'bottom', 'left'].map((pos) => (
        <div key={pos} className={`reflection-image ${pos}`}>
          <img src={model.src} alt={pos} />
        </div>
      ))}
    </div>
  </div>
);

const MicrophonePermissionPrompt = () => (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    zIndex: 1000,
    textAlign: 'center'
  }}>
    Allow microphone access for voice commands
  </div>
);

export default Hologram;