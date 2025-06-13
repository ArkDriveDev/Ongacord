import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg } from '@ionic/react';
import { useHistory } from 'react-router-dom';

// Import your images (adjust the paths as needed)
import Orb1 from '../images/Orb1.gif';
import Orb2 from '../images/Orb2.gif'; // Example additional images
import Orb3 from '../images/Orb3.gif';
import Orb4 from '../images/Orb4.gif';
import JellyFish1 from '../images/JellyFish1.gif';
import JellyFish2 from '../images/JellyFish2.gif';
import JellyFish3 from '../images/JellyFish3.gif';
import JellyFish4 from '../images/JellyFish4.gif';

const Models: React.FC = () => {
  const history = useHistory();

  // Array of all your images (add more as needed)
  const imageList = [
    { id: 1, src: Orb1, name: 'Orb 1' },
    { id: 2, src: Orb2, name: 'Orb 2' },
    { id: 3, src: Orb3, name: 'Orb 3' },
    { id: 4, src: Orb4, name: 'Orb 4' },
    { id: 5, src: JellyFish1, name: 'JellyFish1' },
    { id: 6, src: JellyFish2, name: 'JellyFish2' },
    { id: 7, src: JellyFish3, name: 'JellyFish3' },
    { id: 8, src: JellyFish4, name: 'JellyFish4' },
    // Add more images here...
  ];

  // Split images into groups of 4 for each row
  const rows = [];
  for (let i = 0; i < imageList.length; i += 4) {
    rows.push(imageList.slice(i, i + 4));
  }

  return (
    <IonPage>
      
      <IonContent className="ion-padding">
        <IonGrid>
          {rows.map((row, rowIndex) => (
            <IonRow key={rowIndex}>
              {row.map((image) => (
                <IonCol size="6" size-md="3" key={image.id}>
                  <IonCard 
                    button 
                    onClick={() => history.push(`/model-detail/${image.id}`)} // Optional: Add detail view
                    style={{ height: '100%' }}
                  >
                    <IonCardContent className="ion-text-center">
                      <IonImg 
                        src={image.src} 
                        alt={image.name}
                        style={{ width: '100%', height: '150px', objectFit: 'contain' }}
                      />
                      <h3>{image.name}</h3>
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