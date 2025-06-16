import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, useIonRouter, 
  useIonViewWillEnter, useIonViewWillLeave
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

const DEFAULT_MODEL = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<LocationState>();
  const navigation = useIonRouter();
  const [selectedModel, setSelectedModel] = useState<ModelData>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const haiSound = useRef<HTMLAudioElement | null>(null);
  const isMounted = useRef(true);

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

  const playHaiSound = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!haiSound.current) return resolve();
      
      haiSound.current.currentTime = 0;
      const playPromise = haiSound.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            haiSound.current!.onended = () => resolve();
          })
          .catch(e => {
            console.warn("Audio play failed:", e);
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const handleVoiceCommand = (command: string) => {
    console.log("Command received:", command);
    CommandList(command, navigation);
  };

  // Handle view entry
  useIonViewWillEnter(() => {
    isMounted.current = true;

    (async () => {
      try {
        // Check microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        if (!isMounted.current) return;
        
        setPermissionGranted(true);
        await playHaiSound();
        
        VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(true);
      } catch (error) {
        console.error("Voice initialization failed:", error);
        if (isMounted.current) {
          setPermissionGranted(false);
          setIsVoiceActive(false);
        }
      }
    })();
  });

  // Handle view exit
  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    setIsVoiceActive(false);
    isMounted.current = false;
  });

  // Update model from navigation
  useEffect(() => {
    if (location.state?.model) {
      setSelectedModel(location.state.model);
    }
  }, [location.state]);

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
            Microphone access required for voice commands
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;