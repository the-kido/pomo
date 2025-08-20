import './settings.css'; // Import the styles
import './temp.css'; // Import the styles
import { useState } from 'react';
import { useUiStore } from '../Sidebar';
import { Settings } from 'lucide-react';

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useUiStore();

  // Settings stuff
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<'general' | 'appearance' | 'about'>('general');



  // If the modal is not open, render nothing.
  if (!isSettingsOpen) {
    return null;
  }

  return (
    <>
      {/* backdrop */}
      <div className="modal-backdrop" onClick={closeSettings}></div>
      
      <div className="modal-content">
        <div className="modal-header">
          <h2><Settings />  Settings</h2>
          <button onClick={closeSettings} className="close-button">✖</button>
        </div>
        <div className="modal-body" style={{display: 'flex'}} >
          {/* <div className="settings-layout"></div> */}
            {/* Left menu bar */}
            <div className="settings-menu" style={{display: 'flex', flexDirection: 'column' }}>
              <button
                className={`settings-menu-item${selectedMenu === 'general' ? ' active' : ''}`}
                onClick={() => setSelectedMenu('general')}
              >
                General
              </button>
              <button
                className={`settings-menu-item${selectedMenu === 'appearance' ? ' active' : ''}`}
                onClick={() => setSelectedMenu('appearance')}
              >
                Appearance
              </button>
              <button
                className={`settings-menu-item${selectedMenu === 'about' ? ' active' : ''}`}
                onClick={() => setSelectedMenu('about')}
              >
                About
              </button>
            </div>
            {/* Right content bar */}
            <div className="settings-content">
              {selectedMenu === 'general' && (
                <div>
                  <h3>General Settings</h3>
                  <ToggleSwitch isOn={isDarkMode} handleToggle={() => setIsDarkMode(!isDarkMode)} />
                  <span>Dark Mode</span>
                </div>
              )}
              {selectedMenu === 'appearance' && (
                <div>
                  <h3>Appearance Settings</h3>
                  <p>Theme options will go here.</p>
                </div>
              )}
              {selectedMenu === 'about' && (
                <div>
                  <h3>About</h3>
                  <p>This is a proof of concept settings modal.</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </>
  );
}

interface ToggleSwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

export function ToggleSwitch({ isOn, handleToggle }: ToggleSwitchProps) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isOn} onChange={handleToggle} />
      <span className="slider" />
    </label>
  );
}