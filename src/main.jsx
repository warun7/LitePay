import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import LitePay from './App.jsx'
import './index.css'

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <LitePay />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
