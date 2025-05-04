/* eslint-disable no-unused-vars */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ToastContainer } from 'react-toastify';
import { MeshProvider } from "@meshsdk/react";
import { Buffer } from 'buffer';
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import './index.css'
import "@meshsdk/react/styles.css";

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY


window.Buffer = Buffer;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
  <MeshProvider>
    <BrowserRouter>  
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl={'/'}> 
        <AppContextProvider>
          <ToastContainer />  
          <App />
        </AppContextProvider>
      </ClerkProvider>
    </BrowserRouter>
  </MeshProvider>
)
