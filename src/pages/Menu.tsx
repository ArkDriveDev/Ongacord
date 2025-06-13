import {
  IonButtons, IonContent, IonHeader, IonIcon, IonItem,
  IonMenu, IonMenuButton, IonMenuToggle, IonPage, IonTitle, IonToolbar
} from '@ionic/react';
import { prismOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Hologram from './Hologram';

const Menu: React.FC = () => {
  const history = useHistory();
  const glow = { animation: 'blink 2s infinite', filter: 'drop-shadow(0 0 8px white)' };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle style={{ ...glow, color: 'skyblue' }}>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonMenuToggle autoHide={false}>
            <IonItem 
              button 
              style={{ color: 'skyblue', margin: '3%' }}
              onClick={() => history.push('/')}  // Navigate back to Hologram (homepage)
            >
              <IonIcon icon={prismOutline} slot="start" style={glow} />
              Home (Hologram)
            </IonItem>
          </IonMenuToggle>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton style={glow} />
            </IonButtons>
            <IonTitle style={{ color: 'skyblue' }}>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
         <Hologram/>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Menu;