import { createPortal } from "react-dom";
import { CSSProperties, ReactNode } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";

interface OpenPopup {
  open: boolean,
  x: number, 
  y: number,
  width: number,
  openPopup: (x: number, y: number, width: number) => void,
  closePopup: () => void
}

export const usePausePopupStore = create<OpenPopup>(set => ({
  open: false,
  x: 0,
  y: 0,
  width: 0,
  openPopup: (x: number, y: number, width: number) => set({ x: x, y: y, width: width, open: true }),
  closePopup: () => set({ open: false }),
}));

export const useCheckInPopupStore = create<OpenPopup>(set => ({
  open: false,
  x: 0,
  y: 0,
  width: 0,
  openPopup: (x: number, y: number, width: number) => set({ x: x, y: y, width: width, open: true }),
  closePopup: () => set({ open: false }),
}));

interface ShowCheckIn {
  showingCheckIn: boolean,
  showCheckIn: () => void,
  hideCheckIn: () => void
}

export const useCheckInStore = create<ShowCheckIn>(set => ({
  showingCheckIn: false,
  showCheckIn: () => set({ showingCheckIn: true}),
  hideCheckIn: () => set({ showingCheckIn: false}),
}));

const STYLE: CSSProperties = {
    backgroundColor: 'burlywood',
    position: 'absolute',
    // height: '70%',
    // width: '70%',
    // top: '50%',
    // left: '50%',
    // transform: 'translate(-50%, -50%)',
    // Required to make the anchor the "top right" instead of "top left"
    transform: 'translateX(-100%)',
  }
  
  const TRIANGLE: CSSProperties = {
    transform: 'translateY(-100%) translateX(50%)',
    position: 'absolute',
    top: '0px',
    borderTop: `8px solid transparent`,
    borderLeft: `8px solid transparent`,
    borderRight: `8px solid transparent`,
    borderBottom: '12px solid burlywood',
    zIndex: 999,
    height: '0px',
    width: '0px',
}

function Popup({ children, usePopupStore}: {  children: ReactNode, usePopupStore:  UseBoundStore<StoreApi<OpenPopup>>}) {
  const portalRoot = document.getElementById('portal-root');

  const open = usePopupStore(state => state.open);
  // const x = usePausePopupStore(state => state.x);
  // const y = usePausePopupStore(state => state.y);
  // const width = usePausePopupStore(state => state.width);


  console.log(portalRoot);
  if (!portalRoot) return null;

  return open && <>
    <div className={`popup-overlay ${open ? 'popup-overlay-open' : 'popup-overlay-close'}`} />
    {createPortal(
      <> 
        {/* <div style={{...TRIANGLE, left: x - 16 - width / 2, top: y + 16}}></div> */}
        <div className="popup" style={{ ...STYLE, top: 100, left: 300, position: 'absolute' }}>
          {children}
        </div>
      </>,
      portalRoot
    )}
  </>
}

export default Popup;