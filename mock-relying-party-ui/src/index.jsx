import React from 'react';
import {createRoot} from 'react-dom/client';
import {loadLocales} from './i18n.js';
import App from './App.jsx';
const element=document.getElementById('app');
loadLocales().then(()=>createRoot(element).render(<App/>)).catch(error=>{element.textContent='Portal configuration error: '+error.message;});
