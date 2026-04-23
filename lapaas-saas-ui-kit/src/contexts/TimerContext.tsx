import React, { createContext, useState, useEffect, useCallback } from 'react';

export interface TimerItem {
  id: string;
  name: string;
  type: 'task' | 'meeting' | 'commitment' | 'other';
  elapsedSeconds: number;
}

interface TimerContextType {
  currentTimer: TimerItem | null;
  isRunning: boolean;
  startTimer: (item: TimerItem) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  elapsedTime: string;
}

export const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TIMER_STORAGE_KEY = 'founder_os_timer_state';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage
  const [currentTimer, setCurrentTimer] = useState<TimerItem | null>(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentTimer;
      }
    } catch (error) {
      console.error('Error loading timer from localStorage:', error);
    }
    return null;
  });
  
  const [isRunning, setIsRunning] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.isRunning;
      }
    } catch (error) {
      console.error('Error loading timer state from localStorage:', error);
    }
    return false;
  });
  
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.elapsedSeconds;
      }
    } catch (error) {
      console.error('Error loading elapsed time from localStorage:', error);
    }
    return 0;
  });

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      currentTimer,
      isRunning,
      elapsedSeconds,
      lastSaved: new Date().getTime()
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
  }, [currentTimer, isRunning, elapsedSeconds]);

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && currentTimer) {
      interval = setInterval(() => {
        setElapsedSeconds((prev: number) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, currentTimer]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback((item: TimerItem) => {
    setCurrentTimer(item);
    setElapsedSeconds(item.elapsedSeconds || 0);
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (currentTimer) {
      setCurrentTimer({
        ...currentTimer,
        elapsedSeconds
      });
    }
  }, [currentTimer, elapsedSeconds]);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentTimer(null);
    setElapsedSeconds(0);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        currentTimer,
        isRunning,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        elapsedTime: formatTime(elapsedSeconds)
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = React.useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};
