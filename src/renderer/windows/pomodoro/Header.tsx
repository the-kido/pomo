import { Expand, Grip, PanelBottomClose, Shrink } from 'lucide-react'

export default function Header() {
    return <div
        className='title-bar'
        onMouseEnter={() => console.log('Hovered over title bar')}
        onMouseLeave={() => console.log('Left title bar')}
    >
        <Grip className='window-dragger' />
        {/* <Expand /> */}
        <Shrink />
        <PanelBottomClose />
    </div>
}