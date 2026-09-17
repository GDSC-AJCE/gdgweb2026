"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import CustomDialog from "../components/CustomDialog";

type DialogType = "alert" | "confirm" | "prompt";

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message: string;
    defaultValue?: string;
    resolve: (value: any) => void;
}

interface DialogContextType {
    alert: (message: string, title?: string) => Promise<void>;
    confirm: (message: string, title?: string) => Promise<boolean>;
    prompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<DialogState | null>(null);

    const alert = (message: string, title: string = "Alert") => {
        return new Promise<void>((resolve) => {
            setState({
                isOpen: true,
                type: "alert",
                title,
                message,
                resolve,
            });
        });
    };

    const confirm = (message: string, title: string = "Confirm") => {
        return new Promise<boolean>((resolve) => {
            setState({
                isOpen: true,
                type: "confirm",
                title,
                message,
                resolve,
            });
        });
    };

    const prompt = (message: string, defaultValue: string = "", title: string = "Prompt") => {
        return new Promise<string | null>((resolve) => {
            setState({
                isOpen: true,
                type: "prompt",
                title,
                message,
                defaultValue,
                resolve,
            });
        });
    };

    const handleClose = (value: any) => {
        if (state) {
            state.resolve(value);
            setState(null);
        }
    };

    return (
        <DialogContext.Provider value={{ alert, confirm, prompt }}>
            {children}
            {state && (
                <CustomDialog
                    isOpen={state.isOpen}
                    type={state.type}
                    title={state.title}
                    message={state.message}
                    defaultValue={state.defaultValue}
                    onClose={handleClose}
                />
            )}
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const context = useContext(DialogContext);
    if (context === undefined) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
}
