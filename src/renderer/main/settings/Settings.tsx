import './settings.css'; // Import the styles
import './temp.css'; // Import the styles
import { JSX, useContext, useEffect, useState } from 'react';
import { useUiStore } from '../Sidebar';
import { Menu, Settings, Sticker } from 'lucide-react';
import { SortableSubtask, SubtaskList } from '/src/main/components/EditableList';
import { DragEndEvent } from '@dnd-kit/core/dist';
import { SubtaskItem } from '../createPomodoro/Stages';
import { DEFAULT_POMO_TIMER } from '/src/types/Pomodoro';
import { AppContext } from '../../App';
import { useRewardsStore, useUserSettingsStore } from '/src/main/states/userDataStates';

enum Menus {
  BUILDING,
  APPEARANCE,
  ABOUT
}
const MENU_LABELS: Record<Menus, string> = {
  [Menus.BUILDING]: 'Building Pomos',
  [Menus.APPEARANCE]: 'Appearance',
  [Menus.ABOUT]: 'About',
};

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useUiStore();

  // Settings stuff
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menus>(Menus.BUILDING);


  // If the modal is not open, render nothing.
  if (!isSettingsOpen) {
    return null;
  }

  return (
    <>
      {/* backdrop */}
      <div className="modal-backdrop" onClick={closeSettings}></div>
      
      <div className="modal-content">
          {/* Left menu bar */}
          <div className="settings-menu" style={{display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings style={{paddingRight: '4px'}} />Settings
            </h2>
            <div className='settings-buttons'>
              
              {Object.values(Menus)
                .filter((v) => typeof v === "number")
                .map((menu) => (
                    <SettingsMenuButton
                    key={menu}
                    selected={selectedMenu === menu}
                    label={MENU_LABELS[menu as Menus]}
                    onClick={() => setSelectedMenu(menu as Menus)}
                  />
                )
              )}
            </div>
          </div>
          {/* Right content bar */}
          {/* <div style={{}} > */}

          <div className="settings-content">
            <div className='sticky-content-header'>
              <h2>{MENU_LABELS[selectedMenu]}</h2>
              <button onClick={closeSettings} className="close-button">✖</button>
            </div>
            <div className='settings-main-content'>
              <div style={{padding: '0px 10px'}} >

              {selectedMenu === Menus.BUILDING && (
                <>
                  <h2>Stages Shown</h2>
                </>
              )}
              {selectedMenu === Menus.APPEARANCE && (
                <>
                  <ToggleSwitch isOn={isDarkMode} handleToggle={() => {
                    setIsDarkMode(old => !old)
                  }} />
                  <span>Dark Mode</span>
                </>
                )}
              {selectedMenu === Menus.ABOUT && (
                <BuildingPomoPage />
              )}
              {/* Spacer */}
              <div style={{height: '100px'}} ></div>
            </div>
              </div>
          </div>
          </div>

      {/* </div> */}
    </>
  );
}

function ListOfRewards() {
  const [rewards, setRewards] = useState<string[]>([]);
  const [newReward, setNewReward] = useState("");

  const addReward = () => {
    if (newReward.trim()) {
      setRewards([...rewards, newReward.trim()]);
      setNewReward("");
    }
  };

  const deleteReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Rewards</h3>
      <ul>
        {rewards.map((reward, idx) => (
          <li key={idx} style={{ display: "flex", alignItems: "center" }}>
            <span>{reward}</span>
            <button
              style={{ marginLeft: "8px" }}
              onClick={() => deleteReward(idx)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <input
          type="text"
          value={newReward}
          onChange={e => setNewReward(e.target.value)}
          placeholder="Add a reward"
        />
        <button onClick={addReward}>Add</button>
      </div>
    </div>
  );
}

function SettingsMenuButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void; }) {
  return (
    <button className={`settings-menu-item${selected ? '-active' : ''}`} onClick={onClick} > {label} </button>
  );
}

function Info({text} : {text: string}) {
  
}

interface ToggleSwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

export function ToggleSwitch({ isOn, handleToggle }: ToggleSwitchProps) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isOn} onChange={handleToggle} />
      <span className="slider" />
    </label>
  );
}

function SettingItem({ label, description, control }: {label: string, description: string, control: JSX.Element}) {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <div className="setting-label">{label}</div>
        {description && <div className="setting-description">{description}</div>}
      </div>
      <div className="setting-control">{control}</div>
    </div>
  );
}

function BuildingPomoPage() {
  const appContext = useContext(AppContext)

  const [enabledTaskType, setShowTaskType] = useState(useUserSettingsStore.getState().enabledTaskType);
  const [enableTaskRewards, setShowTaskRewards] = useState(useUserSettingsStore.getState().enabledTaskRewards);

  useEffect(() => {
    const store = useUserSettingsStore.getState()

    store.setEnabledTaskType(enabledTaskType) 
    store.setEnabledTaskRewards(enableTaskRewards)

    appContext.saveData()
  }, [enabledTaskType, enableTaskRewards])

  return <>
    <h2> Toggle Creation Features </h2>
    <div>
      <SettingItem
      label="Task Type"
      description="Lets you specify the type of task to orient you"
      control={
        <ToggleSwitch 
          isOn={enabledTaskType} 
          handleToggle={() => setShowTaskType(old => !old)} 
        />
      }
      />
    <SettingItem
      label="Task Rewards"
      description="Lets you choose what you get once a timer switches to break"
      control={
        <ToggleSwitch 
          isOn={enableTaskRewards}
          handleToggle={() => setShowTaskRewards(old => !old)} 
        />
      }
      />
    </div>

    <h2> Your Creation Options </h2>
    
    <div>
      <SettingItem
        label='Rewards'
        description='Edit the set rewards you can give yourself when switching to break'
        control={
          <SubtaskList 
            initialItems={useRewardsStore.getState().rewards}
            renderItem={(task: SubtaskItem, index: number, remove: (id: string) => void) => <SortableSubtask
              key={task.id} 
              id={task.id} 
              subtask={task.text} 
              completed={false} 
              index={index} 
              onRemove={() => {console.log(task.id, "HELLO"); remove(task.id)}} 
            />}
            onRemove={(subtasks: SubtaskItem[], id: string) => {
              const itemToRemove = subtasks.find(task => task.id === id);
              console.log(itemToRemove)
              if (itemToRemove == null) return
              useRewardsStore.getState().removeReward(itemToRemove.text)
              appContext.saveData()
            }}
            onSubtasksChanged={(subtasks: string[], added: string): void => {
              useRewardsStore.getState().setRewards(subtasks)
              appContext.saveData()
            }} 
          />        
        }
      />
    </div>
  </>
}