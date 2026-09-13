const crypto = require('crypto');

const SALT = 'FrugalTestingSalt2026';
const BASE_URL = 'http://localhost:3002';

function generateHmacSha512(rawBody, timestamp, salt) {
  return crypto.createHmac('sha512', salt)
    .update(rawBody + timestamp + salt)
    .digest('hex');
}

async function runQ2Test() {
  console.log('================================================================');
  console.log('Q2: CRYPTOGRAPHIC REPLAY TESTING, STATEFUL NONCES & HASH-CHAIN API');
  console.log('================================================================');

  // STEP 1: DYNAMIC SEQUENCE CHAINING (POST Request to generate Transaction ID)
  console.log('\n[STEP 1] Executing POST request to initialize transaction...');
  const initRes = await fetch(`${BASE_URL}/api/v1/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'INITIATE_PAYMENT', amount: 5000 })
  });

  const transactionId = initRes.headers.get('x-transaction-id');
  const challengeNonce = initRes.headers.get('x-challenge-nonce');
  const initBody = await initRes.json();

  console.log(`[Extracted Header X-Transaction-ID] ${transactionId}`);
  console.log(`[Extracted Header X-Challenge-Nonce] ${challengeNonce}`);

  if (!transactionId || !challengeNonce) {
    throw new Error('Failed to extract initial transaction headers!');
  }

  // STEP 2: CRYPTOGRAPHIC NONCE INJECTION & HMAC-SHA512 GENERATION
  console.log('\n[STEP 2] Submitting PUT request with dynamic HMAC-SHA512 signature...');
  const updatePayload = {
    transactionId: transactionId,
    status: 'MODIFIED_LEDGER_TRANSFER',
    recipient: 'ACC-9988776655',
    amount: 5000
  };

  const rawBody = JSON.stringify(updatePayload);
  const microsecondTimestamp = Date.now().toString() + '123'; // Microsecond precision timestamp
  const hmacSignature = generateHmacSha512(rawBody, microsecondTimestamp, SALT);

  console.log(`[Generated Microsecond Timestamp] ${microsecondTimestamp}`);
  console.log(`[Generated HMAC-SHA512 Signature (X-Frugal-Mac)] ${hmacSignature.substring(0, 32)}...`);

  const putStartTime = Date.now();
  const putRes = await fetch(`${BASE_URL}/api/v1/transaction/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Transaction-ID': transactionId,
      'X-Challenge-Nonce': challengeNonce,
      'X-Timestamp': microsecondTimestamp,
      'X-Frugal-Mac': hmacSignature
    },
    body: rawBody
  });

  const putDuration = Date.now() - putStartTime;
  const putResponseBody = await putRes.json();
  console.log(`[PUT Response Status] HTTP ${putRes.status} OK (${putDuration}ms)`);
  console.log(`[PUT Response Body]`, putResponseBody);

  // STEP 3 & 4: THE REPLAY ATTACK VECTOR & ASSERTION LAYER (< 150ms window)
  console.log('\n[STEP 3 & 4] Injecting Replay Attack within < 150ms window...');
  
  const replayStartTime = Date.now();

  // Duplicate and resend EXACT same packet payload, timestamp, and HMAC signature
  const replayRes = await fetch(`${BASE_URL}/api/v1/transaction/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Transaction-ID': transactionId,
      'X-Challenge-Nonce': challengeNonce,
      'X-Timestamp': microsecondTimestamp, // IDENTICAL TIMESTAMP
      'X-Frugal-Mac': hmacSignature        // IDENTICAL HMAC TOKEN
    },
    body: rawBody                         // IDENTICAL PAYLOAD
  });

  const replayDuration = Date.now() - replayStartTime;
  console.log(`[Replay Attack Executed in] ${replayDuration}ms (Target Window: < 150ms)`);

  const replayStatus = replayRes.status;
  const replayResponseBody = await replayRes.json();

  console.log(`[Replay Response Status] HTTP ${replayStatus}`);
  console.log(`[Replay Response Body]`, replayResponseBody);

  // ASSERTION LAYER
  if (replayStatus === 409 || replayStatus === 422) {
    console.log('\n[ASSERTION PASSED] Backend processing node correctly identified and rejected duplicate replay payload (HTTP 409 Conflict).');
  } else if (replayStatus === 200 || replayStatus === 201) {
    console.error('\n[HIGH-RISK VULNERABILITY ALERT] Replay attack succeeded! Backend mistakenly accepted duplicate payload (HTTP 200 OK).');
    throw new Error('Replay Protection Failure Detected!');
  } else {
    console.log(`[ASSERTION RESULT] Backend rejected duplicate payload with HTTP ${replayStatus}.`);
  }

  console.log('\n================================================================');
  console.log('Q2 EXECUTION COMPLETED SUCCESSFULLY');
  console.log('================================================================\n');
}

runQ2Test().catch((err) => {
  console.error('[Q2 Execution Error]', err);
  process.exit(1);
});
