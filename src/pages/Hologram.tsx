import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, IonButton,
  IonToast
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceCommands from '../services/VoiceCommands';

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
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(globalSelectedModel || DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showPermissionToast, setShowPermissionToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const voiceButtonRef = useRef<HTMLIonButtonElement>(null);

  // Initialize voice commands and check permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Check if we already have permission
        await VoiceCommands.requestMicrophonePermission();
        // If we get here, permission is granted
        setToastMessage('Microphone access ready! Say "hello"');
        setShowPermissionToast(true);
      } catch (error) {
        // Permission not granted yet, but don't show error - we'll ask when user clicks
        console.log('Microphone permission not yet granted');
      }
    };

    checkPermission();
  }, []);

  // Handle voice activation toggle
  useEffect(() => {
  const handleVoiceActivation = async () => {
  if (isVoiceActive) {
    try {
      await VoiceCommands.enable(() => {
        setIsVoiceActive(false);
      });
      setToastMessage('Listening for commands... Say "hello"');
      setShowPermissionToast(true);
    } catch (error) {
      setIsVoiceActive(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable voice commands';
      setToastMessage(errorMessage);
      setShowPermissionToast(true);
    }
  } else {
    VoiceCommands.disable();
  }
};

    handleVoiceActivation();

    return () => {
      VoiceCommands.disable();
    };
  }, [isVoiceActive]);

  useEffect(() => {
    if (location.state?.model) {
      globalSelectedModel = location.state.model;
      setSelectedModel(location.state.model);
    } else if (!globalSelectedModel) {
      globalSelectedModel = DEFAULT_MODEL;
      setSelectedModel(DEFAULT_MODEL);
    }
  }, [location.state]);

  const handleVoiceToggle = () => {
    setIsVoiceActive(prev => !prev);
  };

  if (!selectedModel) {
    return (
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
  }

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              ref={voiceButtonRef}
              fill={isVoiceActive ? 'solid' : 'outline'}
              color={isVoiceActive ? 'success' : 'medium'}
              onClick={handleVoiceToggle}
            >
              {isVoiceActive ? '🎤 Listening...' : '🎤'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <div className="hologram-center">
          <div className="reflection-base">
            <div className="reflection-image top">
              <img src={selectedModel.src} alt="Top" />
            </div>
            <div className="reflection-image right">
              <img src={selectedModel.src} alt="Right" />
            </div>
            <div className="reflection-image bottom">
              <img src={selectedModel.src} alt="Bottom" />
            </div>
            <div className="reflection-image left">
              <img src={selectedModel.src} alt="Left" />
            </div>
          </div>
        </div>
      </IonContent>

      <IonToast
        isOpen={showPermissionToast}
        onDidDismiss={() => setShowPermissionToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
      />
    </IonPage>
  );
};

export default Hologram;