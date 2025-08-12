import { useStore } from "zustand";
import { useExtensionStateStore, useOllamaStateStore } from "/src/main/states/appStates";
import React, { useEffect } from "react";
import { ipcRenderer } from "electron";


interface StatusProps {
    label: string;
    status: "active" | "inactive" | "error";
    info: string;
}

const statusColors: Record<StatusProps["status"], string> = {
    active: "green",
    inactive: "gray",
    error: "red",
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
                    border: "1px solid #ccc",
                }}
            />
        </div>
    );
}

export default function ServiceStatuses()
{
    const isOllamaActive = useOllamaStateStore(state => state.isOllamaActive);
    const isExtensionConnected = useExtensionStateStore(state => state.isExtensionConnected);

    useEffect(() => {
        window.states.onOllamaStateChanged((newState: boolean) => {
            useOllamaStateStore.getState().setOllamaActive(newState);
            console.log("OLLAMA CHANGED: ", newState )
        });
        window.states.onExtensionStateChanged((newState: boolean) => {
            useExtensionStateStore.getState().setExtensionConnected(newState);
            console.log("EXTNEISOn CHANGED: ", newState)
        });
    }, []);

    return <>
        <Status
            label="Ollama"
            status={isOllamaActive ? "active" : "inactive"}
            info="Something?"
        />
        <Status
            label="Extension"
            status={isExtensionConnected ? "active" : "inactive"}
            info="Other?"
        />
    </>
}