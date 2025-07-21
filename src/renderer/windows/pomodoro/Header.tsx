import { Expand, Grip, PanelBottomClose, Shrink } from 'lucide-react'

export default function Header({ onClose } : { onClose: () => void }) {
    return <div className='title-bar'>
        <div>
            <Grip className='window-dragger'/>
        </div>
        <div>
            <Shrink/>
            <PanelBottomClose onClick={onClose} />
        </div>
    </div>
}