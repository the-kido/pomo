import { Expand, Grip, PanelBottomClose, Shrink } from 'lucide-react'

export default function Header({ onClose, isShrunk, toggleSize }: { onClose: () => void, isShrunk: boolean, toggleSize: (toggle: boolean) => void }) {
    return <div className='title-bar'>
        <div>
            <Grip className='window-dragger' />
        </div>
        <div onClick={() => toggleSize(!isShrunk)}>
            { isShrunk ? <Expand /> : <Shrink /> }
            <PanelBottomClose onClick={onClose} />
        </div>
    </div>
}