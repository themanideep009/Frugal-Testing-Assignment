const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const SALT = 'FrugalTestingSalt2026';
let activeTransactions = new Map();
let processedSignatures = new Set();

// 1. Dynamic Sequence Chaining: POST to generate transaction ID wrapper
app.post('/api/v1/transaction', (req, res) => {
  const transactionId = 'TXN-' + crypto.randomUUID();
  const challengeNonce = crypto.randomBytes(16).toString('hex');
  
  activeTransactions.set(transactionId, {
    nonce: challengeNonce,
    createdAt: Date.now()
  });

  console.log(`[Mock API] Generated Transaction ID: ${transactionId} | Challenge Nonce: ${challengeNonce}`);

  res.setHeader('X-Transaction-ID', transactionId);
  res.setHeader('X-Challenge-Nonce', challengeNonce);
  res.status(201).json({
    status: 'INITIALIZED',
    transactionId: transactionId,
    challengeNonce: challengeNonce
  });
});

// 2. Cryptographic Nonce Injection & Replay Attack Vector Handling
app.put('/api/v1/transaction/update', (req, res) => {
  const hmacHeader = req.headers['x-frugal-mac'];
  const timestampHeader = req.headers['x-timestamp'];
  const transactionId = req.headers['x-transaction-id'];

  if (!hmacHeader || !timestampHeader || !transactionId) {
    return res.status(400).json({ error: 'Missing security headers' });
  }

  const rawBody = JSON.stringify(req.body);

  // Compute expected HMAC-SHA512 hash: HMAC-SHA512(rawBody + timestamp + salt)
  const expectedHmac = crypto.createHmac('sha512', SALT)
    .update(rawBody + timestampHeader + SALT)
    .digest('hex');

  if (hmacHeader !== expectedHmac) {
    return res.status(401).json({ error: 'Invalid HMAC Authentication Signature' });
  }

  // 3. Replay Attack Detection (Unique signature check within timestamp window)
  const payloadSignature = `${transactionId}:${timestampHeader}:${hmacHeader}`;

  if (processedSignatures.has(payloadSignature)) {
    console.log(`[SECURITY ALERT] Replay Attack Blocked! Duplicate signature detected: ${payloadSignature}`);
    return res.status(409).json({
      error: 'Replay Attack Detected',
      message: 'Duplicate transaction payload submitted within replay window.',
      code: 'HTTP_409_CONFLICT'
    });
  }

  // Record signature to enforce replay protection
  processedSignatures.add(payloadSignature);

  res.status(200).json({
    status: 'SUCCESS',
    transactionId: transactionId,
    updatedPayload: req.body,
    message: 'Cryptographic signature validated successfully.'
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`[Q2 Mock Gateway] Running on http://localhost:${PORT}`);
});
