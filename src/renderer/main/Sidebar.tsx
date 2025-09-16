import { Menu } from "/src/renderer/App";
import { Settings } from "lucide-react";

import { create } from 'zustand';

interface UiState {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));


export default function Sidebar({menuAt, setMenuAt} : {menuAt: Menu, setMenuAt: (newMenu: Menu) => void}) {
	const openSettings = useUiStore((state) => state.openSettings);

	return <div className="side-bar">
		{/* Top */}
		<div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--medium-padding)', marginBottom: 'var(--medium-padding)' }} >
			<button 
				style={{background: 'none', border: 'none' }} 
				title="Settings"
				onClick={openSettings}
			>
				<Settings />
			</button>
		</div>
		{/* Middle */}
		<div className="settings-buttons" style={{flex: 1}}>
			{Object.entries(Menu).map(([menuKey, label]) => (
				<button
					key={menuKey}
					// style={{ display: 'block', width: '100%', margin: '8px 0' }}
					className={`menu-button${menuAt === label ? '-active' : ''}`}
					onClick={() => setMenuAt(label)}
				>
					{label}
				</button>
			))}
		</div>

		{/* Bottom */}
		<div>
			The Pomo App © 2025
		</div>
	</div>
}