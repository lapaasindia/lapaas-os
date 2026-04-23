import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Square, AlertCircle, Plus } from 'lucide-react';

interface MeetingTimerProps {
  meetingId: string;
  duration?: number; // in minutes
  onTimerComplete?: () => void;
}

export interface MeetingTimerRef {
  startTimer: () => void;
  stopTimer: () => void;
}

const MeetingTimer = forwardRef<MeetingTimerRef, MeetingTimerProps>(({ meetingId, duration = 60, onTimerComplete }, ref) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [extendedMinutes, setExtendedMinutes] = useState(0);

  const totalSeconds = (duration + extendedMinutes) * 60;
  const remainingSeconds = totalSeconds - elapsedSeconds;
  const percentComplete = (elapsedSeconds / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => {
          const newValue = prev + 1;
          
          // Check for warnings
          const percent = (newValue / totalSeconds) * 100;
          if (percent >= 80 && percent < 100) {
            setShowWarning(true);
          }
          
          // Check for completion
          if (newValue >= totalSeconds) {
            setIsRunning(false);
            if (onTimerComplete) onTimerComplete();
          }
          
          return newValue;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, totalSeconds, onTimerComplete]);

  const handleStart = async () => {
    try {
      // If resuming from pause, just restart the timer
      if (isPaused && sessionId) {
        setIsRunning(true);
        setIsPaused(false);
        return;
      }

      // Otherwise, start a new session
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/timer/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.data.id);
        setIsRunning(true);
        setIsPaused(false);
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handlePause = async () => {
    try {
      // Save current elapsed time to backend
      if (sessionId) {
        await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/timer/pause`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, elapsed_seconds: elapsedSeconds })
        });
      }
      setIsRunning(false);
      setIsPaused(true);
    } catch (error) {
      console.error('Error pausing timer:', error);
      // Still pause locally even if API fails
      setIsRunning(false);
      setIsPaused(true);
    }
  };

  const handleStop = async () => {
    if (!window.confirm('Stop and end this meeting timer? This will save the current time.')) return;
    
    try {
      if (sessionId) {
        await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/timer/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, elapsed_seconds: elapsedSeconds })
        });
      }
      setIsRunning(false);
      setIsPaused(false);
      // Don't reset elapsed seconds - keep the time recorded
      // setElapsedSeconds(0);
      setSessionId(null);
      setShowWarning(false);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const handleExtend = (minutes: number) => {
    setExtendedMinutes(prev => prev + minutes);
    setShowWarning(false);
  };

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    startTimer: handleStart,
    stopTimer: handleStop
  }));

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (percentComplete >= 100) return 'bg-red-500';
    if (percentComplete >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Meeting Timer</h3>
        {showWarning && percentComplete < 100 && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle size={16} />
            <span>{percentComplete >= 100 ? '100%' : '80%'} time elapsed</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-white mb-2">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-sm text-gray-400">
          Remaining: {formatTime(Math.max(0, remainingSeconds))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, percentComplete)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0:00</span>
          <span>{Math.round(percentComplete)}%</span>
          <span>{formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
          >
            <Play size={20} />
            {isPaused ? 'Resume' : 'Start Timer'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
          >
            <Pause size={20} />
            Pause
          </button>
        )}
        
        <button
          onClick={handleStop}
          disabled={!sessionId}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
        >
          <Square size={20} />
          End
        </button>
      </div>

      {/* Extend Meeting */}
      <div className="flex gap-2">
        <button
          onClick={() => handleExtend(15)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center gap-1 text-sm transition"
        >
          <Plus size={16} />
          +15m
        </button>
        <button
          onClick={() => handleExtend(30)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center gap-1 text-sm transition"
        >
          <Plus size={16} />
          +30m
        </button>
        <button
          onClick={() => handleExtend(60)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center gap-1 text-sm transition"
        >
          <Plus size={16} />
          +1h
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        <span className={`text-sm font-medium ${
          isRunning ? 'text-green-400' : isPaused ? 'text-yellow-400' : 'text-gray-400'
        }`}>
          {isRunning ? '● Running' : isPaused ? '⏸ Paused' : '○ Stopped'}
        </span>
        {extendedMinutes > 0 && (
          <span className="text-xs text-blue-400 ml-2">
            (+{extendedMinutes}m extended)
          </span>
        )}
      </div>
    </div>
  );
});

MeetingTimer.displayName = 'MeetingTimer';

export default MeetingTimer;
