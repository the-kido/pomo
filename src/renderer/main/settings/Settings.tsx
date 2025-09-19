import './settings.css'; // Import the styles
import './slider.css'; // Import the styles
import { useContext, useEffect, useState } from 'react';
import { useUiStore } from '../Sidebar';
import { MoveLeftIcon, Settings, X } from 'lucide-react';
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

  const [test, setTest] = useState<string>("Unknown")

  
  useEffect(() => {
    setTest(window.app.getAppVersion())
  }, [])
  
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
          <div className="side-bar" style={{paddingTop: '0px', display: 'flex', flexDirection: 'column' }}>
            <div>

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
          </div>
          {/* Right content bar */}
          <div className="settings-content">
            <div className='sticky-content-header'>
              <h2>{MENU_LABELS[selectedMenu]}</h2>
              <button title='Close' onClick={closeSettings} className="close-button"> <X /> </button>
            </div>
            <div className='settings-main-content-scroll-area'>
              <div className='settings-main-content'>
                {selectedMenu === Menus.BUILDING && (
                  <BuildingPomoPage />
                )}
                {selectedMenu === Menus.APPEARANCE && (
                  <AppearancePage/>
                )}
                {selectedMenu === Menus.ABOUT && (
                  <>
                    <Divider text={"Service Statuses"}>
                      <ServiceStatuses/>
                    </Divider> 
                    <Divider text={"Credits"}>
                      Made by kido! <br />
                      Version: {test}
                    </Divider>
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

function SettingItem({ label, description, children }: {label: string, description: string, children: React.ReactNode} ) {
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

function Divider({ text, children }: { text: string; children: React.ReactNode }) {
  return ( <>
    <h3 style={{ paddingTop: '1em' }}>
      {text}
    </h3>
    <div>
      {children}
    </div>
  </>
  )
}

function BuildingPomoPage() {
  const appContext = useContext(AppContext)

  const [enabledTaskType, setShowTaskType] = useState(useUserSettingsStore.getState().enabledTaskType);
  const [enableTaskRewards, setShowTaskRewards] = useState(useUserSettingsStore.getState().enabledTaskRewards);
  const [enableSpecifyMotive, setEnableSpecifyMotive] = useState(useUserSettingsStore.getState().enabledSpecifyMotive);

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
    store.setEnabledSpecifyMotive(enableSpecifyMotive)

    appContext.saveData({
      user: {
        ...useUserDataStore.getState().getUserData().user, // Preserve all existing settings
        enabledTaskRewards: enableTaskRewards,
        enabledTaskType: enabledTaskType,
        enabledSpecifyMotive: enableSpecifyMotive,
      }
    });
  }, [enabledTaskType, enableTaskRewards, enableSpecifyMotive])

  return <>
    <Divider text='Toggle Creation Features'>

      <SettingItem
        label="Task Type"
        description="Lets you specify the type of task to orient you"
        > 
        <ToggleSwitch 
          isOn={enabledTaskType} 
          handleToggle={() => setShowTaskType(old => !old)} 
          />
      </SettingItem>
      {/* <SettingItem
        label="Task Rewards"
        description="Lets you choose what you get once a timer switches to break"
        > 
        <ToggleSwitch 
          isOn={enableTaskRewards}
          handleToggle={() => setShowTaskRewards(old => !old)} 
          />
      </SettingItem> */}
      
      <SettingItem
        label="Motivation"
        description="When describing your task, specify *why* you're doing it"
        > 
        <ToggleSwitch 
          isOn={enableSpecifyMotive}
          handleToggle={() => setEnableSpecifyMotive(old => !old)} 
          />
      </SettingItem>
    
    </Divider>

    <Divider text='Your Creation Options'>

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
    </Divider>
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

  return ( 
    <Divider text='Theme'>
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
    </Divider>
  )
}