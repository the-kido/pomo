import { createPortal } from "react-dom";
import { CSSProperties, ReactNode } from "react";
import { create } from "zustand";

interface OpenPopup {
  open: boolean,
  x: number, 
  y: number,
  width: number,
  openPopup: (x: number, y: number, width: number) => void,
  closePopup: () => void
}

export const usePopupStore = create<OpenPopup>(set => ({
  open: false,
  x: 0,
  y: 0,
  width: 0,
  openPopup: (x: number, y: number, width: number) => set({ x: x, y: y, width: width, open: true }),
  closePopup: () => set({ open: false }),
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

function Popup({ children /*, onClose */}: {  children: ReactNode /*, onClose: () => void */ }) {
  const portalRoot = document.getElementById('portal-root');

  const open = usePopupStore(state => state.open);
  const x = usePopupStore(state => state.x);
  const y = usePopupStore(state => state.y);
  const width = usePopupStore(state => state.width);


  console.log(portalRoot);
  if (!portalRoot) return null;

  return open && <>
    <div className={`popup-overlay ${open ? 'popup-overlay-open' : 'popup-overlay-close'}`} />
    {createPortal(
      <> 
        <div style={{...TRIANGLE, left: x - 16 - width / 2, top: y + 16}}></div>
        <div className="popup" style={{ ...STYLE, top: y + 16, left: x, position: 'absolute' }}>
          {children}
        </div>
      </>,
      portalRoot
    )}
  </>
}

export default Popup;