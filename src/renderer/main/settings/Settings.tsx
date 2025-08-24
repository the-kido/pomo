import './settings.css'; // Import the styles
import './slider.css'; // Import the styles
import { useContext, useEffect, useState } from 'react';
import { useUiStore } from '../Sidebar';
import { Settings } from 'lucide-react';
import { SortableSubtask, SubtaskList } from '/src/main/components/EditableList';
import { SubtaskItem } from '../createPomodoro/Stages';
import { AppContext } from '../../App';
import { useGoalStore, useRewardsStore, useUserDataStore, useUserSettingsStore } from '/src/main/states/userDataStates';
import ServiceStatuses from '../ServiceStatuses';

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
              <Settings className='icon' style={{paddingRight: '4px'}} />Settings
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
          <div className="settings-content">
            <div className='sticky-content-header'>
              <h2>{MENU_LABELS[selectedMenu]}</h2>
              <button onClick={closeSettings} className="close-button">✖</button>
            </div>
            <div className='settings-main-content'>
              <div style={{padding: '0px 10px'}} >

              {selectedMenu === Menus.BUILDING && (
                <BuildingPomoPage />
              )}
              {selectedMenu === Menus.APPEARANCE && (
               <AppearancePage/>
                )}
              {selectedMenu === Menus.ABOUT && (
                <>
                  <Divider text={"Service Statuses"}/> 
                  <ServiceStatuses/>

                  <Divider text={"Credits"} />
                  Made by kido!
                </>
              )}
              {/* Spacer */}
              <div style={{height: '100px'}} ></div>
            </div>
              </div>
          </div>
      </div>
    </>
  );
}

function SettingsMenuButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void; }) {
  return (
    <button className={`menu-button${selected ? '-active' : ''}`} onClick={onClick} > {label} </button>
  );
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

function SettingItem({ label, description, children }: {label: string, description: string, children:  React.ReactNode} ) {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <div className="setting-label">{label}</div>
        {description && <div className="setting-description">{description}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function Divider({text}: {text: string}) {
  return <h3 style={{paddingTop: '1em'}}>
    {text}
  </h3>
}

function BuildingPomoPage() {
  const appContext = useContext(AppContext)

  const [enabledTaskType, setShowTaskType] = useState(useUserSettingsStore.getState().enabledTaskType);
  const [enableTaskRewards, setShowTaskRewards] = useState(useUserSettingsStore.getState().enabledTaskRewards);

  const goals = useGoalStore.getState().goals;

  useEffect(() => {
    appContext.saveData({user: {
      ...useUserDataStore.getState().getUserData().user,
      goals: goals
    }})
  }, [goals])

  const rewards = useRewardsStore.getState().rewards;

  useEffect(() => {
    appContext.saveData({user: {
      ...useUserDataStore.getState().getUserData().user,
      rewards: rewards
    }})
  }, [rewards])

  useEffect(() => {
    const store = useUserSettingsStore.getState()

    store.setEnabledTaskType(enabledTaskType) 
    store.setEnabledTaskRewards(enableTaskRewards)

    appContext.saveData({
      user: {
        ...useUserDataStore.getState().getUserData().user, // Preserve all existing settings
        enabledTaskRewards: enableTaskRewards,
        enabledTaskType: enabledTaskType
      }
    });
  }, [enabledTaskType, enableTaskRewards])

  return <>
    <Divider text='Toggle Creation Features' />
    <div>
      <SettingItem
        label="Task Type"
        description="Lets you specify the type of task to orient you"
      > 
        <ToggleSwitch 
          isOn={enabledTaskType} 
          handleToggle={() => setShowTaskType(old => !old)} 
        />
      </SettingItem>
      <SettingItem
        label="Task Rewards"
        description="Lets you choose what you get once a timer switches to break"
      > 
      <ToggleSwitch 
          isOn={enableTaskRewards}
          handleToggle={() => setShowTaskRewards(old => !old)} 
        />
      </SettingItem>
    </div>

    <Divider text='Your Creation Options' />
    
    <div>
      <SettingItem
        label='Goals'
        description='Edit the list of goals you set to achieve for active tasks'
      >
      <SubtaskList 
          initialItems={goals}
          renderItem={(task: SubtaskItem, index: number, remove: (id: string) => void) => <SortableSubtask
            key={task.id} 
            id={task.id} 
            subtask={task.text} 
            completed={false} 
            index={index} 
            onRemove={() => remove(task.id)} 
          />}
          onRemove={(subtasks: SubtaskItem[], id: string) => {
            const itemToRemove = subtasks.find(task => task.id === id);
            if (itemToRemove == null) return
            useGoalStore.getState().removeGoal(itemToRemove.text)
          }}
          onSubtasksChanged={(subtasks: string[]): void => {
            useGoalStore.getState().setGoals(subtasks)
          }} 
        />        
      </SettingItem>

      <SettingItem
        label='Rewards'
        description='Edit the set rewards you can give yourself when switching to break'
      >
        <SubtaskList 
          initialItems={rewards}
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
            
            if (itemToRemove == null) return
            useRewardsStore.getState().removeReward(itemToRemove.text)
          }}
          onSubtasksChanged={(subtasks: string[], added: string): void => {
            useRewardsStore.getState().setRewards(subtasks)
          }} 
          >
        </SubtaskList>   
      </SettingItem>
    </div>
  </>
}

function AppearancePage() {

  const isDarkMode = useUserSettingsStore.getState().darkMode;
  const setUsingDarkMode = useUserSettingsStore.getState().setUsingDarkMode;
  
  const appContext = useContext(AppContext)

  useEffect(() => {
    appContext.saveData({user: {
      ...useUserDataStore.getState().getUserData().user,
      darkMode: isDarkMode}
    })
  }, [isDarkMode])

  return <div>
    <Divider text='Theme' />
    <SettingItem 
      label={'Dark Mode'} 
      description={'Need I say more?'}
    >
      <ToggleSwitch 
        isOn={isDarkMode} 
        handleToggle={() => {
          setUsingDarkMode(!isDarkMode)
        }}
      />
    </SettingItem>
  </div>
}