import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Initialize internal translations
import { defineCustomElements } from '@ionic/pwa-elements/loader';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);
