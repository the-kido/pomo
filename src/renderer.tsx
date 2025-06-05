import './index.css';
import { createRoot } from 'react-dom/client';
import App from './main/App';

console.log("what")

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App/>);
}
 