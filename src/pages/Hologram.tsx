import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, useIonRouter
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';
import hai from '../Responses/CuteResponse/hai.wav';

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
  const haiSound = useRef<HTMLAudioElement | null>(null);

  // Initialize hai.wav sound
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

  const handleVoiceCommand = (command: string) => {
    CommandList(command, navigation); // Play sound & handle command
  };

  // ✅ Main voice + mic init with hai.wav first
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Close mic

        setPermissionGranted(true);

        if (haiSound.current) {
          haiSound.current.currentTime = 0;
          haiSound.current.play()
            .then(() => {
              haiSound.current!.onended = () => {
                console.log("✅ hai.wav finished, starting voice");
                VoiceService.startListening(handleVoiceCommand);
                setIsVoiceActive(true);
              };
            })
            .catch(err => {
              console.warn("⚠️ hai.wav failed to play:", err);
              VoiceService.startListening(handleVoiceCommand);
              setIsVoiceActive(true);
            });
        } else {
          VoiceService.startListening(handleVoiceCommand);
          setIsVoiceActive(true);
        }

      } catch (error) {
        console.error("Voice initialization failed:", error);
        setPermissionGranted(false);
      }
    };

    initializeVoice();

    return () => {
      VoiceService.stopListening();
    };
  }, []);

  // Handle selected model from navigation
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
          <div slot="end" style={{
            color: isVoiceActive ? '#4CAF50' : '#ccc',
            padding: '0 16px',
            fontSize: '0.8rem'
          }}>
            {isVoiceActive ? 'Active' : 'Off'}
          </div>
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

        {!permissionGranted && (
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
            Microphone access required for voice
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;
