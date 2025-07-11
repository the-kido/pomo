interface WarnProps {confirmText: string, onYes: () => void, onNo: () => void}

export default function Warn({confirmText, onYes, onNo}: WarnProps) {
    return <>
        <div className={`popup-overlay`} />
        <div>
            <div className="popup">
                <h2>{confirmText}</h2>
                <p>This action cannot be undone.</p>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <button onClick={() => onYes()}>Yes</button>
                    <button onClick={() => onNo()}>No</button>
                </div>
            </div>
        </div>
    </>

}