"use client";
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';

interface TutorialContextType {
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    next: () => void;
    skip: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
    children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
    const [step, setStep] = useState<number>(0);
    const [laststep, setLastStep] = useState<number>(6);

    useEffect(() => {
        const action = sessionStorage.getItem("action");
        const tutorial = sessionStorage.getItem("tutorial");
        if (action === "register" && tutorial === "true") {
            setStep(1)
        } else {
            setStep(0)
        }
    }, [])

    useEffect(() => {
        if (step >= 6) {
            sessionStorage.setItem("action", "login");
            sessionStorage.setItem("tutorial", "false")
        }
    }, [step])

    const next = () => {
        setStep((prev) => prev + 1)
        if (step >= 6) {
            sessionStorage.setItem("action", "login");
            sessionStorage.setItem("tutorial", "false")
        } else if (step > 6) {
            window.location.reload()
        }
    };
    const skip = () => {
        sessionStorage.setItem("action", "login");
        sessionStorage.setItem("tutorial", "false")
        setStep(0)
        window.location.reload()
    };

    return (
        <TutorialContext.Provider value={{ step, setStep, next, skip }}>
            {children}
        </TutorialContext.Provider>
    );
}

export const useTutorial = (): TutorialContextType => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error("useTutorial must be used within a TutorialProvider");
    }
    return context;
};
