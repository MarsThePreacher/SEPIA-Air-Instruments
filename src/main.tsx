import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './lib/theme';
import './styles/global.css';
import App from './App';
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}
createRoot(rootElement).render(<StrictMode>
    <App />
  </StrictMode>);
