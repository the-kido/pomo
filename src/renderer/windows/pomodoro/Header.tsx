import { Expand, Grip, Minus, PanelBottomClose, Shrink } from 'lucide-react'

export default function Header({ onClose, isShrunk, toggleSize, minimize }: { onClose: () => void, isShrunk: boolean, toggleSize: (toggle: boolean) => void, minimize: () => void }) {
	return <div className='title-bar' style={{borderBottom: '1px solid var(--border-color)'}} >
		<div style={{flex: 1}} className='window-dragger'>
			{/* <Grip size={18}/> */}
		</div>
		<div style={{display: 'flex'}}>
			
			<button style={{padding: 0 }} onClick={() => minimize()} className='window-control'>
				<Minus size={18}/>
			</button>
			
			<div style={{margin: '2px'}}> </div>
			
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