import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import "./index.css";

import { ScreenOrientation } from '@capacitor/screen-orientation';


ScreenOrientation.lock({orientation: "landscape"}).catch((err: Error) => {
    if(err.toString().toLowerCase().includes("not available")) {
        return;
    }
    console.error(err);
});


 // <React.StrictMode> в дев-моде вызывает все коллбэки по 2 раза!
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
