import { RemoteCommand, RemoteState } from '../types';

// Relay Server Configuration
const RELAY_SERVER_URL = 'wss://lumo-relay.onrender.com';

// Generate simple random session ID (React Native compatible)
function generateRandomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type MessageHandler = (command: RemoteCommand) => void;
type ConnectionHandler = (connected: boolean) => void;
type StateHandler = (state: RemoteState) => void;
type Role = 'teleprompter' | 'remote' | null;

class RelayWebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private role: Role = null;
  private messageHandlers: MessageHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private stateHandlers: StateHandler[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = false;

  // Event handlers
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onConnectionChange(handler: ConnectionHandler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  onStateUpdate(handler: StateHandler) {
    this.stateHandlers.push(handler);
    return () => {
      this.stateHandlers = this.stateHandlers.filter((h) => h !== handler);
    };
  }

  private notifyConnection(connected: boolean) {
    this.connectionHandlers.forEach((h) => h(connected));
  }

  private notifyMessage(command: RemoteCommand) {
    this.messageHandlers.forEach((h) => h(command));
  }

  private notifyState(state: RemoteState) {
    this.stateHandlers.forEach((h) => h(state));
  }

  // Generate unique session ID for teleprompter mode
  generateSessionId(): string {
    // Generate a short, easy-to-type session ID
    const id = generateRandomId();
    this.sessionId = id;
    return id;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getRole(): Role {
    return this.role;
  }

  getRelayUrl(): string {
    return RELAY_SERVER_URL;
  }

  // Connect to relay server as teleprompter (host)
  connectAsTeleprompter(): Promise<{ success: boolean; sessionId: string | null }> {
    return new Promise((resolve) => {
      try {
        this.disconnect();
        this.role = 'teleprompter';
        this.shouldReconnect = true;
        const sessionId = this.generateSessionId();
        
        const url = `${RELAY_SERVER_URL}/session/${sessionId}`;
        console.log('Connecting to relay as teleprompter:', url);
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('Teleprompter connected to relay, session:', sessionId);
          // Send join message to register as teleprompter
          this.ws?.send(JSON.stringify({
            type: 'join',
            role: 'teleprompter',
            sessionId,
          }));
          this.notifyConnection(true);
          resolve({ success: true, sessionId });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          console.log('Teleprompter disconnected from relay');
          this.notifyConnection(false);
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('Teleprompter WebSocket error:', error);
          resolve({ success: false, sessionId: null });
        };

        // Timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            resolve({ success: false, sessionId: null });
          }
        }, 10000);
      } catch (error) {
        console.error('Error connecting as teleprompter:', error);
        resolve({ success: false, sessionId: null });
      }
    });
  }

  // Connect to relay server as remote control
  connectAsRemote(sessionId: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.disconnect();
        this.role = 'remote';
        this.sessionId = sessionId.toUpperCase();
        this.shouldReconnect = true;
        
        const url = `${RELAY_SERVER_URL}/session/${this.sessionId}`;
        console.log('Connecting to relay as remote:', url);
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('Remote connected to relay, session:', this.sessionId);
          // Send join message to register as remote
          this.ws?.send(JSON.stringify({
            type: 'join',
            role: 'remote',
            sessionId: this.sessionId,
          }));
          this.notifyConnection(true);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          console.log('Remote disconnected from relay');
          this.notifyConnection(false);
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('Remote WebSocket error:', error);
          resolve(false);
        };

        // Timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            resolve(false);
          }
        }, 10000);
      } catch (error) {
        console.error('Error connecting as remote:', error);
        resolve(false);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'state':
          // State update from teleprompter (for remote to display)
          this.notifyState(data.payload as RemoteState);
          break;
        case 'command':
          // Command from remote (for teleprompter to execute)
          this.notifyMessage(data.payload as RemoteCommand);
          break;
        case 'play':
        case 'pause':
        case 'stop':
        case 'speed':
        case 'seek':
          // Direct command
          this.notifyMessage(data as RemoteCommand);
          break;
        case 'error':
          console.error('Relay error:', data.message);
          break;
        case 'peer_connected':
          console.log('Peer connected to session');
          break;
        case 'peer_disconnected':
          console.log('Peer disconnected from session');
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing relay message:', error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.shouldReconnect && this.sessionId) {
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect to relay...');
        if (this.role === 'teleprompter') {
          this.connectAsTeleprompter();
        } else if (this.role === 'remote' && this.sessionId) {
          this.connectAsRemote(this.sessionId);
        }
      }, 3000);
    }
  }

  // Send command (from remote to teleprompter)
  sendCommand(command: RemoteCommand) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'command',
        payload: command,
      }));
    }
  }

  // Broadcast state (from teleprompter to remotes)
  broadcastState(state: RemoteState) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'state',
        payload: state,
      }));
    }
  }

  // Legacy method for compatibility
  send(command: RemoteCommand) {
    this.sendCommand(command);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionId = null;
    this.role = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new RelayWebSocketService();
