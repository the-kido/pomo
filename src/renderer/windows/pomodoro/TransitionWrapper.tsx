import React, { useState, useEffect } from 'react';
import './transition.css'; // We'll create this next

interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
  transitionTime?: number;
}

const TRANSITION_TIME = 300;

export default function TransitionWrapper({ children, show } : TransitionProps) { 
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 25); // Wait a bit to make sure DOM updates
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), TRANSITION_TIME);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return shouldRender ? (
    <div className={`transition-element ${isVisible ? 'visible' : 'hidden'}`}>
      {children}
    </div>
  ) : null;
};
