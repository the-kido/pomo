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

export default function Sidebar() {
	const openSettings = useUiStore((state) => state.openSettings);

	return <div className="side-bar">
		{/* Top */}
		<div>
			<button 
				style={{background: 'none', border: 'none' }} 
				title="Settings"
				onClick={openSettings}
			>
				<Settings />
			</button>
		</div>

		{/* Bottom */}
		<div>
			The Pomo App © 2025
		</div>
	</div>
}