
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Group } from "lucide-react";
import { Lucide } from "lucide-react";

// Register the Group icon
Lucide.registerIcon("GroupIcon", Group);

createRoot(document.getElementById("root")!).render(<App />);
