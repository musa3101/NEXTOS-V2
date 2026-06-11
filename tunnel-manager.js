const { spawn } = require('child_process');
const http = require('http');

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

// Start the tunnel!
startTunnel();
