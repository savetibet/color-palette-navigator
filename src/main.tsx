
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// No need to use createLucideIcon since we can use Group directly
createRoot(document.getElementById("root")!).render(<App />);
