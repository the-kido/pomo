interface SubtaskProps {
  taskDescription: string, percent: number, completed?: boolean, setTaskComplete: () => void
}

export default function Subtask(props: SubtaskProps) {
  const { taskDescription, percent, completed, setTaskComplete } = props;

  return <div className='subtask-box' style={{ color: `rgb(0, 0, 0, ${percent})`, borderColor: !completed ? `rgb(255, 0, 0, ${percent})` : `rgb(0, 255, 255, ${percent})` }}>
    <h3 style={{margin: '0px'}}> {taskDescription} </h3>
    <input type='checkbox' defaultChecked={completed} onClick={setTaskComplete} disabled={completed}></input>
  </div>
}
