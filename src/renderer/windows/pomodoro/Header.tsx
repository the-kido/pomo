import { Expand, Grip, PanelBottomClose, Shrink } from 'lucide-react'

export default function Header({ onClose, isShrunk, toggleSize }: { onClose: () => void, isShrunk: boolean, toggleSize: (toggle: boolean) => void }) {
	return <div className='title-bar'>
		<div style={{flex: 1}} className='window-dragger'>
			<Grip size={18}/>
		</div>
		<div style={{display: 'flex'}}>
			<button style={{padding: 0 }} onClick={() => toggleSize(!isShrunk)} className='window-control'>
				{ isShrunk ? <Expand size={18}/> : <Shrink size={18} /> }
			</button>
			
			<div style={{margin: '2px'}}> </div>
			
			<button  style={{padding: 0}} className='window-control' onClick={onClose}>
				<PanelBottomClose  size={18}/>
			</button>
		</div>
	</div>
}