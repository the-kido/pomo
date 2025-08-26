import { useExtensionStateStore, useOllamaStateStore } from "/src/main/states/appStates";
import { useEffect } from "react";


interface StatusProps {
    label: string;
    status: "Active" | "Inactive" | "Error";
    info: string;
}

const statusColors: Record<StatusProps["status"], string> = {
    Active: "green",
    Inactive: "gray",
    Error: "red",
};

export function Status({ label, status, info }: StatusProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{label}</span>
            <div
                title={info}
                style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: statusColors[status],
                    marginLeft: 8,
                    cursor: "pointer",
                    border: "1px solid var(--text-color)",
                }}
            />
        </div>
    );
}

export default function ServiceStatuses()
{
    const isOllamaActive = useOllamaStateStore(state => state.isOllamaActive);
    const isExtensionConnected = useExtensionStateStore(state => state.isExtensionConnected);

    return <>
        <Status
            label="Ollama"
            status={isOllamaActive ? "Active" : "Inactive"}
            info={isOllamaActive ? "Ollama is running. LLM features will be available." : "Ollama is not running. LLM features are unavailable."}
        />
        <Status
            label="Extension"
            status={isExtensionConnected ? "Active" : "Inactive"}
            info={isExtensionConnected ? "The sibling extension is connected." : "The sibling extension is not connected."}
        />
    </>
}