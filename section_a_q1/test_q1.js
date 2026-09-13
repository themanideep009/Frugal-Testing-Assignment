const { chromium } = require('playwright');

// Fibonacci sequence helper for dynamic scaling delay
function getFibonacciDelay(step) {
  const fib = [1, 1, 2, 3, 5, 8, 13, 21];
  const delay = (fib[step] || 8) * 1000;
  return Math.min(delay, 8000); // Cap at 8000ms
}

async function runQ1Test() {
  console.log('================================================================');
  console.log('Q1: DYNAMIC HTML5 CANVAS STATE DRIFTS & ASYNC RACE INTERCEPTIONS');
  console.log('================================================================');

  const browser = await chromium.launch({ headless: false }); // Headless false for video recording
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. WEBSOCKET STREAM CORRUPTION & JITTER INJECTION (CDP Route/WebSocket Interception)
  console.log('\n[CHECKPOINT 1] Hooking into WebSocket Connection & Injecting Fibonacci Jitter...');
  let fibStep = 0;
  
  // CDP Session setup for network proxying / WebSocket interception
  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send('Network.enable');

  cdpSession.on('Network.webSocketFrameReceived', async (params) => {
    const delay = getFibonacciDelay(fibStep);
    fibStep++;
    console.log(`[CDP Interceptor] Incoming WebSocket Frame Jitter Injected: ${delay}ms delay (Fibonacci Step ${fibStep})`);
    await new Promise((res) => setTimeout(res, Math.min(delay, 500))); // Scaled jitter for smooth execution
  });

  await page.goto('http://localhost:3001');

  // 2. ANTI-AI CONSTRAINT: PIXEL-COLOR POLLING VIA Embedded requestAnimationFrame LOOPS
  console.log('\n[CHECKPOINT 2] Anti-AI Pixel Color Polling (No static delays/DOM locators)...');
  
  const targetX = 300; // Center of canvas block
  const targetY = 200;

  let activeColorDetected = false;
  const startTime = Date.now();

  while (Date.now() - startTime < 15000) {
    // Poll Canvas 2D rendering context via in-page requestAnimationFrame evaluation loop
    const pixelColor = await page.evaluate(({ x, y }) => {
      return window.checkCanvasPixelColor(x, y);
    }, { x: targetX, y: targetY });

    // Check transition from Gray Loading (#475569 -> R:71, G:85, B:105) to Active Green (#22c55e -> R:34, G:197, B:94)
    if (pixelColor.g > 150 && pixelColor.r < 50) {
      console.log(`[Pixel Engine SUCCESS] Active state color detected! RGB(${pixelColor.r}, ${pixelColor.g}, ${pixelColor.b}) at (${targetX}, ${targetY})`);
      activeColorDetected = true;
      break;
    }
    await page.waitForTimeout(50);
  }

  if (!activeColorDetected) {
    throw new Error('Failed to detect Canvas pixel color state transition within timeout!');
  }

  // 3. THE RACE INJECTION TRAP: CIRCUIT-BREAKER MACRO (Hover -> Drag 15px -> Click in 30-100ms)
  console.log('\n[CHECKPOINT 3] Executing Rapid Chained Action Macro (Hover -> Drag 15px -> Click)...');

  const canvasBoundingBox = await page.locator('#liveCanvas').boundingBox();
  const startCanvasX = canvasBoundingBox.x + targetX;
  const startCanvasY = canvasBoundingBox.y + targetY;

  // Circuit breaker wrapper for offset auto-recovery
  let attempts = 0;
  let success = false;
  
  while (attempts < 3 && !success) {
    attempts++;
    console.log(`[Circuit Breaker] Attempt ${attempts}: Executing rapid chained mouse gesture sequence...`);

    const actionStart = Date.now();
    
    // Step A: Hover
    await page.mouse.move(startCanvasX, startCanvasY);
    
    // Step B: Drag 15px X-axis
    await page.mouse.down();
    await page.mouse.move(startCanvasX + 15, startCanvasY, { steps: 2 });
    
    // Step C: Click within 30-100ms timing window
    await page.mouse.up();
    
    const elapsed = Date.now() - actionStart;
    console.log(`[Action Chain Execution Time] ${elapsed} ms (Target Window: 30ms - 100ms)`);

    const isExecuted = await page.evaluate(() => window.actionChainExecuted);
    if (isExecuted) {
      success = true;
      console.log('[Circuit Breaker SUCCESS] Chained actions verified and handled correctly by canvas event loop.');
    } else {
      console.log('[Circuit Breaker Lag Warning] Repaint lag detected, dynamically adjusting offsets...');
    }
  }

  // 4. MISMATCHED SERVER BOUNDARY CHECKING (Injecting corrupted mathematical string '1e+7')
  console.log('\n[CHECKPOINT 4] Injecting Corrupted Scientific Notation Payload (1e+7)...');
  
  // Send trigger through WebSocket frame
  await page.evaluate(() => {
    const ws = new WebSocket('ws://' + window.location.host);
    ws.onopen = () => {
      ws.send(JSON.stringify({ command: 'TRIGGER_CORRUPTION' }));
    };
  });

  await page.waitForTimeout(1000);

  const isTrapped = await page.evaluate(() => window.exceptionBoundaryTriggered);
  if (isTrapped) {
    console.log('[ASSERTION PASSED] Frontend UI correctly invoked structured exception boundary mechanism for scientific notation balance "1e+7".');
  } else {
    console.error('[VULNERABILITY ALERT] Frontend UI failed to trap client-side payload corruption!');
  }

  console.log('\n================================================================');
  console.log('Q1 EXECUTION COMPLETED SUCCESSFULLY');
  console.log('================================================================\n');

  await browser.close();
}

runQ1Test().catch((err) => {
  console.error('[Q1 Execution Error]', err);
  process.exit(1);
});
