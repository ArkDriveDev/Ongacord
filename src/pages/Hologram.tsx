import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, useIonViewWillEnter, useIonViewWillLeave, useIonViewDidEnter
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';
import hello from '../Responses/CuteResponse/hello1.ogg';
import reverseImage from '../images/reverse.png';
import wanya from '../Responses/CuteResponse/Wanya.mp3';
import success from '../Responses/CuteResponse/Success.mp3';
import { fetchAvailableModels } from '../services/ModelsService';

interface HologramModel {
  id: number;
  name: string;
  src: string;
}

const DEFAULT_MODEL: HologramModel = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<{ model?: HologramModel }>();
  const [selectedModel, setSelectedModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isModelChanging, setIsModelChanging] = useState(false);
  const [modelChangeTimeout, setModelChangeTimeout] = useState<NodeJS.Timeout | null>(null);

  const wanyaSound = useRef(new Audio()).current;
  useEffect(() => {
    wanyaSound.src = wanya;
    wanyaSound.load();
  }, []);
  
  const successSound = useRef(new Audio()).current;
  useEffect(() => {
    successSound.src = success;
    successSound.load();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' &&
          mutation.attributeName === 'aria-hidden' &&
          mutation.target instanceof HTMLElement &&
          mutation.target.id === 'main-content') {
          mutation.target.removeAttribute('aria-hidden');
        }
      });
    });

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      observer.observe(mainContent, { attributes: true });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSelectedModel(location.state?.model || DEFAULT_MODEL);
  }, [location.state]);

  const playHelloSound = () => {
    if (audioRef.current) {
      VoiceService.setSystemAudioState(true);
      setIsResponding(true);

      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play error:", e));

      audioRef.current.onended = () => {
        VoiceService.setSystemAudioState(false);
        setIsResponding(false);
      };

      audioRef.current.onerror = () => {
        VoiceService.setSystemAudioState(false);
        setIsResponding(false);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        VoiceService.setSpeakingState(false);
      }
    };
  }, []);

  const handleReverseClick = () => {
    setIsReversed(!isReversed);
    wanyaSound.play().catch(e => console.error("Failed to play audio:", e));
  };

  const handleModelChange = useCallback(async (modelName: string | null) => {
    if (!modelName) {
      setIsModelChanging(false);
      return;
    }

    try {
      const models = await fetchAvailableModels();
      const normalizedInput = modelName.toLowerCase().trim();

      // Find matching model
      const model = models.find(m =>
        m.name.toLowerCase() === normalizedInput ||
        m.name.toLowerCase().includes(normalizedInput)
      );

      if (model) {
        setSelectedModel(model);
      }
    } catch (error) {
      console.error("Model change error:", error);
      // Optional: Play error sound
    } finally {
      setIsModelChanging(false);
    }
  }, []);

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      setIsResponding(true);

      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }

      const result = await CommandList(command);

      if (result.action === 'changeModel' && result.model) {
        setIsModelChanging(true);
        setSelectedModel(result.model);
        successSound.play().catch(e => console.error("Failed to play audio:", e));
      }

      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000);
    } catch (error) {
      console.error("Command error:", error);
      setIsResponding(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    audioRef.current = new Audio(hello);
    audioRef.current.preload = 'auto';

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);

        const started = await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(started);

        if (started) {
          playHelloSound();
        }
      } catch (error) {
        console.error("Voice init error:", error);
        setPermissionGranted(false);
        setIsVoiceActive(false);
      }
    };
    initialize();

    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsResponding(false);
      };
      audioRef.current.onplay = () => {
        setIsResponding(true);
      };
    }
  });

  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    setIsVoiceActive(false);
    setIsResponding(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    if (modelChangeTimeout) {
      clearTimeout(modelChangeTimeout);
    }
  });

  useIonViewDidEnter(() => {
    const hiddenPages = document.querySelectorAll('.ion-page-hidden');
    hiddenPages.forEach(page => {
      page.setAttribute('inert', '');
      page.removeAttribute('aria-hidden');
    });
  });

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
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
        <div className={`hologram-center ${isResponding ? 'pulse-effect' : ''}`}>
          <img
            src={reverseImage}
            alt="Reverse Hologram"
            className="center-image"
            onClick={handleReverseClick}
            onError={(e) => console.error("Failed to load center image")}
          />
          <div className={`reflection-base ${isReversed ? 'reversed' : ''}`}>
            {['top', 'right', 'bottom', 'left'].map((position) => (
              <div
                key={position}
                className={`reflection-image ${position}`}
              >
                <img
                  src={selectedModel.src}
                  alt={`${position} Reflection`}
                  onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
                />
              </div>
            ))}
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