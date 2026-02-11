# Lumo Relay Server

WebSocket relay server for Lumo Teleprompter remote control feature.

## Deployment on Render

### 1. Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Set the **Root Directory** to: `relay-server`

### 2. Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `lumo-relay` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter for production) |

### 3. Environment Variables

No environment variables required. The server uses `PORT` which Render provides automatically.

### 4. Deploy

Click **Create Web Service** and wait for deployment.

Your relay URL will be:
```
wss://lumo-relay.onrender.com
```

## Usage

### WebSocket Endpoint

```
wss://YOUR-SERVICE.onrender.com/session/{sessionId}
```

### Message Types

**Join (first message after connection):**
```json
{
  "type": "join",
  "role": "teleprompter" | "remote",
  "sessionId": "A1B2C3D4"
}
```

**State (teleprompter → remotes):**
```json
{
  "type": "state",
  "payload": {
    "isPlaying": true,
    "speed": 50,
    "position": 1234,
    "scriptTitle": "My Script"
  }
}
```

**Command (remote → teleprompter):**
```json
{
  "type": "command",
  "payload": {
    "type": "play" | "pause" | "stop" | "speed",
    "payload": { "speed": 75 }
  }
}
```

**Peer events (server → clients):**
```json
{ "type": "peer_connected", "role": "teleprompter" | "remote" }
{ "type": "peer_disconnected", "role": "teleprompter" | "remote" }
```

## App Configuration

After deploying, update your app's relay URL:

```typescript
// src/services/websocketService.ts
const RELAY_SERVER_URL = 'wss://lumo-relay.onrender.com';
```

## Features

- Session-based routing via URL path
- Automatic cleanup of stale sessions (1 hour timeout)
- Heartbeat for dead connection detection
- Graceful shutdown handling
- No external dependencies except `ws`
- Production-ready and memory-leak free

## Local Development

```bash
cd relay-server
npm install
npm start
```

Server will run on `http://localhost:10000`
