const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 10000;
const sessions = new Map();

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`Lumo Relay Server running on port ${PORT}`);
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Expected path: /session/{sessionId}
  if (pathParts[0] !== 'session' || !pathParts[1]) {
    ws.close(4000, 'Invalid path. Use /session/{sessionId}');
    return;
  }

  const sessionId = pathParts[1].toUpperCase();
  let role = null;

  // Initialize session if doesn't exist
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      teleprompter: null,
      remotes: new Set(),
      lastActivity: Date.now()
    });
  }

  const session = sessions.get(sessionId);
  session.lastActivity = Date.now();

  ws.sessionId = sessionId;
  ws.isAlive = true;

  // Handle pong for heartbeat
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      session.lastActivity = Date.now();

      // Handle join message to determine role
      if (message.type === 'join') {
        role = message.role;
        ws.role = role;

        if (role === 'teleprompter') {
          // Only one teleprompter per session
          if (session.teleprompter && session.teleprompter.readyState === 1) {
            ws.close(4001, 'Session already has a teleprompter');
            return;
          }
          session.teleprompter = ws;
          // Notify remotes that teleprompter connected
          session.remotes.forEach(remote => {
            if (remote.readyState === 1) {
              remote.send(JSON.stringify({ type: 'peer_connected', role: 'teleprompter' }));
            }
          });
        } else if (role === 'remote') {
          session.remotes.add(ws);
          // Notify teleprompter that remote connected
          if (session.teleprompter && session.teleprompter.readyState === 1) {
            session.teleprompter.send(JSON.stringify({ type: 'peer_connected', role: 'remote' }));
          }
        }
        return;
      }

      // Relay messages based on type
      if (message.type === 'state') {
        // State from teleprompter -> broadcast to all remotes
        if (role === 'teleprompter') {
          const stateMsg = JSON.stringify(message);
          session.remotes.forEach(remote => {
            if (remote.readyState === 1) {
              remote.send(stateMsg);
            }
          });
        }
      } else if (message.type === 'command') {
        // Command from remote -> send to teleprompter
        if (role === 'remote' && session.teleprompter && session.teleprompter.readyState === 1) {
          session.teleprompter.send(JSON.stringify(message));
        }
      } else {
        // Direct command types (play, pause, stop, speed, seek)
        if (role === 'remote' && session.teleprompter && session.teleprompter.readyState === 1) {
          session.teleprompter.send(JSON.stringify(message));
        }
      }
    } catch (err) {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    if (!sessions.has(sessionId)) return;

    const session = sessions.get(sessionId);

    if (role === 'teleprompter') {
      session.teleprompter = null;
      // Notify remotes
      session.remotes.forEach(remote => {
        if (remote.readyState === 1) {
          remote.send(JSON.stringify({ type: 'peer_disconnected', role: 'teleprompter' }));
        }
      });
    } else if (role === 'remote') {
      session.remotes.delete(ws);
      // Notify teleprompter
      if (session.teleprompter && session.teleprompter.readyState === 1) {
        session.teleprompter.send(JSON.stringify({ type: 'peer_disconnected', role: 'remote' }));
      }
    }

    // Clean up empty sessions
    if (!session.teleprompter && session.remotes.size === 0) {
      sessions.delete(sessionId);
    }
  });

  ws.on('error', () => {
    // Silent error handling
  });
});

// Heartbeat to detect dead connections
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Clean up stale sessions (no activity for 1 hour)
const cleanup = setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  sessions.forEach((session, sessionId) => {
    if (now - session.lastActivity > maxAge) {
      // Close all connections in stale session
      if (session.teleprompter && session.teleprompter.readyState === 1) {
        session.teleprompter.close(4002, 'Session expired');
      }
      session.remotes.forEach(remote => {
        if (remote.readyState === 1) {
          remote.close(4002, 'Session expired');
        }
      });
      sessions.delete(sessionId);
    }
  });
}, 60000);

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(heartbeat);
  clearInterval(cleanup);
  wss.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  clearInterval(heartbeat);
  clearInterval(cleanup);
  wss.close(() => {
    process.exit(0);
  });
});
