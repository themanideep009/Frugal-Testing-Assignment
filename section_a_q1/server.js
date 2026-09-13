const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static canvas HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>HTML5 Canvas WebSocket Testbed - Q1</title>
      <style>
        body { background: #0f172a; color: #fff; font-family: monospace; text-align: center; margin: 0; padding: 20px; }
        #canvas-container { position: relative; display: inline-block; margin-top: 20px; border: 2px solid #38bdf8; border-radius: 8px; }
        canvas { background: #1e293b; display: block; cursor: crosshair; }
        #status { font-size: 16px; margin: 10px; color: #94a3b8; }
        #log { margin-top: 15px; color: #f43f5e; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Dynamic HTML5 Canvas WebSocket Sandbox</h2>
      <div id="status">Connecting to WebSocket...</div>
      <div id="canvas-container">
        <canvas id="liveCanvas" width="600" height="400"></canvas>
      </div>
      <div id="log"></div>

      <script>
        const canvas = document.getElementById('liveCanvas');
        const ctx = canvas.getContext('2d');
        const statusEl = document.getElementById('status');
        const logEl = document.getElementById('log');

        let gridState = { x: 250, y: 150, width: 100, height: 100, color: '#475569', state: 'GRAY_LOADING', value: 0 };
        let mouseEvents = [];

        function render() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw grid layout background
          ctx.strokeStyle = '#334155';
          for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
          }

          // Draw dynamic element
          ctx.fillStyle = gridState.color;
          ctx.fillRect(gridState.x, gridState.y, gridState.width, gridState.height);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(gridState.x, gridState.y, gridState.width, gridState.height);

          ctx.fillStyle = '#ffffff';
          ctx.font = '14px monospace';
          ctx.fillText('State: ' + gridState.state, gridState.x + 10, gridState.y + 40);
          ctx.fillText('Val: ' + gridState.value, gridState.x + 10, gridState.y + 65);

          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        // Global function for Playwright in-browser requestAnimationFrame polling
        window.checkCanvasPixelColor = function(targetX, targetY) {
          const pixel = ctx.getImageData(targetX, targetY, 1, 1).data;
          return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
        };

        // Connect to WebSocket
        const ws = new WebSocket('ws://' + window.location.host);

        ws.onopen = () => {
          statusEl.innerText = 'WebSocket Connected. Waiting for state activation...';
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'STATE_UPDATE') {
              gridState.color = data.color;
              gridState.state = data.state;
              gridState.value = data.value;
              statusEl.innerText = 'Active State: ' + data.state + ' | Color: ' + data.color;
            } else if (data.type === 'CORRUPTED_PAYLOAD_EXCEPTION') {
              // Exception boundary mechanism simulation
              logEl.innerText = '[EXCEPTION BOUNDARY TRAPPED] Corrupted Server Payload Received: ' + data.value;
              window.exceptionBoundaryTriggered = true;
            }
          } catch(e) {
            logEl.innerText = '[PARSER ERROR] Unhandled Stream Mutation!';
          }
        };

        // Event listeners for chained action validation
        canvas.addEventListener('mousemove', (e) => {
          const rect = canvas.getBoundingClientRect();
          window.lastHoverX = e.clientX - rect.left;
          window.lastHoverY = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseup', (e) => {
          const rect = canvas.getBoundingClientRect();
          window.lastClickX = e.clientX - rect.left;
          window.lastClickY = e.clientY - rect.top;
          window.actionChainExecuted = true;
        });
      </script>
    </body>
    </html>
  `);
});

wss.on('connection', (ws) => {
  console.log('[WS] Client Connected');
  
  // 1. Initial State: Gray Loading Threshold
  ws.send(JSON.stringify({ type: 'STATE_UPDATE', color: '#475569', state: 'GRAY_LOADING', value: 0 }));

  // 2. Transition to Active Element Color after 2.5s
  setTimeout(() => {
    ws.send(JSON.stringify({ type: 'STATE_UPDATE', color: '#22c55e', state: 'ACTIVE_READY', value: 100 }));
  }, 2500);

  // Handle incoming messages from test runner
  ws.on('message', (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.command === 'TRIGGER_CORRUPTION') {
      // Send corrupted mathematical state string scientific notation 1e+7
      ws.send(JSON.stringify({ 
        type: 'CORRUPTED_PAYLOAD_EXCEPTION', 
        state: 'CORRUPTED', 
        value: '1e+7' 
      }));
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[Q1 Server] Running on http://localhost:${PORT}`);
});
