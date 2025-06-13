import { IonContent, IonPage } from '@ionic/react';
import Orb1 from '../images/Orb1.gif';
import './Hologram.css';

const Hologram: React.FC = () => {
  // Adjust these values (in pixels)
  const imageDistance = 100; // Distance from center
  const imageSize = 150;     // Image width/height

  return (
    <IonPage>
      <IonContent fullscreen className="hologram-container">
        {/* Centered container */}
        <div className="hologram-center">
          {/* Base layout */}
          <div 
            className="reflection-base"
            style={{
              width: `${imageDistance * 2}px`,
              height: `${imageDistance * 2}px`
            }}
          >
            {/* Top */}
            <div 
              className="reflection-image top" 
              style={{ 
                width: imageSize,
                height: imageSize,
                top: `-${imageDistance}px`
              }}
            >
              <img src={Orb1} alt="Top" />
            </div>
            
            {/* Right */}
            <div 
              className="reflection-image right" 
              style={{ 
                width: imageSize,
                height: imageSize,
                right: `-${imageDistance}px`
              }}
            >
              <img src={Orb1} alt="Right" />
            </div>
            
            {/* Bottom */}
            <div 
              className="reflection-image bottom" 
              style={{ 
                width: imageSize,
                height: imageSize,
                bottom: `-${imageDistance}px`
              }}
            >
              <img src={Orb1} alt="Bottom" />
            </div>
            
            {/* Left */}
            <div 
              className="reflection-image left" 
              style={{ 
                width: imageSize,
                height: imageSize,
                left: `-${imageDistance}px`
              }}
            >
              <img src={Orb1} alt="Left" />
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Hologram;