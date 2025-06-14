import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

// Import your images
import Orb1 from '../images/Orb1.gif';
import Orb2 from '../images/Orb2.gif';
import Orb3 from '../images/Orb3.gif';
import Orb4 from '../images/Orb4.gif';
import JellyFish1 from '../images/JellyFish1.gif';
import JellyFish2 from '../images/JellyFish2.gif';
import JellyFish3 from '../images/JellyFish3.gif';
import JellyFish4 from '../images/JellyFish4.gif';
import ModelSearch from '../components/ModelsProps/ModelSearch';

const Models: React.FC = () => {
  const history = useHistory();

  const imageList = [
    { id: 1, src: Orb1, name: 'Orb 1' },
    { id: 2, src: Orb2, name: 'Orb 2' },
    { id: 3, src: Orb3, name: 'Orb 3' },
    { id: 4, src: Orb4, name: 'Orb 4' },
    { id: 5, src: JellyFish1, name: 'JellyFish 1' },
    { id: 6, src: JellyFish2, name: 'JellyFish 2' },
    { id: 7, src: JellyFish3, name: 'JellyFish 3' },
    { id: 8, src: JellyFish4, name: 'JellyFish 4' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>3D Models</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      {/* Added marginTop to push content down */}
      <IonContent style={{ marginTop: '30px' }}>
        <ModelSearch/>
        <IonGrid style={{ paddingTop: '20px' }}>
          {Array.from({ length: Math.ceil(imageList.length / 4) }).map((_, rowIndex) => (
            <IonRow key={rowIndex}>
              {imageList.slice(rowIndex * 4, rowIndex * 4 + 4).map((image) => (
                <IonCol size="6" size-md="3" key={image.id}>
                  <IonCard 
                    button 
                    onClick={() => history.push(`/model-detail/${image.id}`)}
                    style={{ 
                      height: '100%',
                      margin: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <IonCardContent style={{ textAlign: 'center' }}>
                      <IonImg 
                        src={image.src} 
                        alt={image.name}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'contain',
                          padding: '10px'
                        }}
                      />
                      <h3 style={{ 
                        margin: '10px 0 5px',
                        fontSize: '1rem',
                        color: '#333'
                      }}>{image.name}</h3>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Models;