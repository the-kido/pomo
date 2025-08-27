import './popup.css'

import { createPortal } from "react-dom";
import { ReactNode } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";

interface OpenPopup {
  topShift: string,
  open: boolean,
  closePopup: () => void,
  showBackground: boolean
}

// interface SwitchPopup extends OpenPopup {
//   message: string;
//   selfLogPrompt: string;
//   openPopup: (message: string, selfLogPrompt: string) => void;
// }

// TEMP name!

export const usePausePopupStore = create<OpenPopup & {openPopup: () => void}>(set => ({
  showBackground: true,
  topShift: '70px',
  open: false,
  openPopup: () => set({ open: true }),
  closePopup: () => set({ open: false }),
}));


function Popup({ children, usePopupStore}: {  children: ReactNode, usePopupStore: UseBoundStore<StoreApi<OpenPopup>>}) {
  const portalRoot = document.getElementById('portal-root');
  const topShift = usePopupStore(state => state.topShift);
  const showBackground = usePopupStore(state => state.showBackground);

  const open = usePopupStore(state => state.open);
  if (!portalRoot) return null;
  
  return open && <>
    {showBackground && <div className={`popup-overlay ${open ? 'popup-overlay-open' : 'popup-overlay-close'}`} />}
    
    {createPortal(
      <div className="popup" style={{ top: topShift }}>
        {children}
      </div>,
      portalRoot
    )}
  </>
}

export default Popup;