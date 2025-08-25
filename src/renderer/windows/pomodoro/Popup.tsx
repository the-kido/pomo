import './popup.css'

import { createPortal } from "react-dom";
import { ReactNode } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";

interface OpenPopup {
  open: boolean,
  openPopup: () => void,
  closePopup: () => void
}

export const usePausePopupStore = create<OpenPopup>(set => ({
  open: false,
  openPopup: () => set({ open: true }),
  closePopup: () => set({ open: false }),
}));

export const useCheckInPopupStore = create<OpenPopup>(set => ({
  open: false,
  x: 0,
  y: 0,
  width: 0,
  openPopup: () => set({ open: true }),
  closePopup: () => set({ open: false }),
}));


function Popup({ children, usePopupStore}: {  children: ReactNode, usePopupStore: UseBoundStore<StoreApi<OpenPopup>>}) {
  const portalRoot = document.getElementById('portal-root');

  const open = usePopupStore(state => state.open);
  if (!portalRoot) return null;

  return open && <>
    <div className={`popup-overlay ${open ? 'popup-overlay-open' : 'popup-overlay-close'}`} />
    
    {createPortal(
      <div className="popup">
        {children}
      </div>,
      portalRoot
    )}
  </>
}

export default Popup;