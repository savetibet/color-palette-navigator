
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Group } from "lucide-react";
import { createLucideIcon } from "lucide-react";

// Register the Group icon as a custom icon
const GroupIcon = createLucideIcon('GroupIcon', Group);

createRoot(document.getElementById("root")!).render(<App />);
