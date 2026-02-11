import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ConnectionMode, RemoteCommand, RemoteState } from '../types';
import { websocketService } from '../services/websocketService';

interface RemoteContextType {
  mode: ConnectionMode;
  isConnected: boolean;
  sessionId: string | null;
  remoteState: RemoteState | null;
  setMode: (mode: ConnectionMode) => void;
  startTeleprompterSession: () => Promise<string | null>;
  joinSession: (sessionId: string) => Promise<boolean>;
  disconnect: () => void;
  sendCommand: (command: RemoteCommand) => void;
  broadcastState: (state: RemoteState) => void;
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export function RemoteProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ConnectionMode>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null);

  useEffect(() => {
    const unsubConnection = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    const unsubState = websocketService.onStateUpdate((state) => {
      setRemoteState(state);
    });

    return () => {
      unsubConnection();
      unsubState();
    };
  }, []);

  // Start as teleprompter - connect to relay and get session ID
  const startTeleprompterSession = useCallback(async (): Promise<string | null> => {
    try {
      const result = await websocketService.connectAsTeleprompter();
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
        setMode('teleprompter');
        return result.sessionId;
      }
      return null;
    } catch (error) {
      console.error('Error starting teleprompter session:', error);
      return null;
    }
  }, []);

  // Join as remote control using session ID
  const joinSession = useCallback(async (id: string): Promise<boolean> => {
    try {
      const connected = await websocketService.connectAsRemote(id);
      if (connected) {
        setMode('remote');
        setSessionId(id.toUpperCase());
      }
      return connected;
    } catch (error) {
      console.error('Error joining session:', error);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setMode(null);
    setIsConnected(false);
    setSessionId(null);
    setRemoteState(null);
  }, []);

  const sendCommand = useCallback((command: RemoteCommand) => {
    websocketService.sendCommand(command);
  }, []);

  const broadcastState = useCallback((state: RemoteState) => {
    websocketService.broadcastState(state);
  }, []);

  return (
    <RemoteContext.Provider
      value={{
        mode,
        isConnected,
        sessionId,
        remoteState,
        setMode,
        startTeleprompterSession,
        joinSession,
        disconnect,
        sendCommand,
        broadcastState,
      }}
    >
      {children}
    </RemoteContext.Provider>
  );
}

export function useRemote() {
  const context = useContext(RemoteContext);
  if (!context) {
    throw new Error('useRemote must be used within RemoteProvider');
  }
  return context;
}
