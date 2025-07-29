interface SubtaskProps {
  taskDescription: string, percent: number, completed?: boolean, setTaskComplete: () => void
}

export default function Subtask(props: SubtaskProps) {
  const { taskDescription, percent, completed, setTaskComplete } = props;

  return <div className={`subtask-box ${completed ? 'subtask-box-completed' : 'subtask-box-incomplete'}`} style={{'--percent': percent} as React.CSSProperties}>
    <h3> {taskDescription} </h3>
    <input type='checkbox' defaultChecked={completed} onClick={setTaskComplete} disabled={completed}></input>
  </div>
}
