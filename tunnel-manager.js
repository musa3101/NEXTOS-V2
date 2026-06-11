const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

function getProductionUrl() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/PRODUCTION_URL\s*=\s*([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return null;
}

function getTelegramToken() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/TELEGRAM_BOT_TOKEN\s*=\s*([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return null;
}

function startTunnel() {
  console.log("Starting localtunnel...");
  const lt = spawn('npx', ['localtunnel', '--port', '3001']);

  lt.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[localtunnel] ${output.trim()}`);
    
    // Parse URL (e.g. "your url is: https://...")
    const match = output.match(/your url is: (https:\/\/[^\s]+)/);
    if (match) {
      const url = match[1];
      console.log(`New tunnel URL: ${url}`);
      
      // Register webhook with Telegram
      const setupUrl = `http://localhost:3001/api/telegram/setup?url=${url}/api/telegram/webhook`;
      console.log(`Registering webhook: ${setupUrl}`);
      
      // Delay slightly to make sure local Next.js server is ready
      setTimeout(() => {
        http.get(setupUrl, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            console.log(`Webhook setup response: ${body}`);
          });
        }).on('error', (err) => {
          console.error(`Failed to register webhook: ${err.message}`);
        });
      }, 1000);
    }
  });

  lt.stderr.on('data', (data) => {
    console.error(`[localtunnel err] ${data.toString().trim()}`);
  });

  lt.on('close', (code) => {
    console.log(`localtunnel process exited with code ${code}. Restarting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });
}

// Graceful cleanup on exit
function restoreWebhookToProduction() {
  const token = getTelegramToken();
  const prodUrl = getProductionUrl() || 'https://nextos-v2.vercel.app'; // Fallback Vercel URL
  
  if (!token) {
    console.log("[tunnel-manager] Missing TELEGRAM_BOT_TOKEN, cannot restore webhook.");
    process.exit(0);
  }

  const targetUrl = `${prodUrl}/api/telegram/webhook`;
  console.log(`[tunnel-manager] Restoring Telegram webhook to production: ${targetUrl}...`);
  
  const api = `https://api.telegram.org/bot${token}/setWebhook`;
  const postData = JSON.stringify({ url: targetUrl });

  const req = http.request(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`[tunnel-manager] Restore response: ${body}`);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error(`[tunnel-manager] Error restoring webhook: ${e.message}`);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

// Signal listeners for clean exit
let isExiting = false;
function handleExit(signal) {
  if (isExiting) return;
  isExiting = true;
  console.log(`\n[tunnel-manager] Received signal ${signal}. Starting webhook recovery...`);
  restoreWebhookToProduction();
}

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));
process.on('SIGHUP', () => handleExit('SIGHUP'));

// Start the tunnel!
startTunnel();
