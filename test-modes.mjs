#!/usr/bin/env node

import { spawn } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Test both server modes
async function testServerModes() {
  console.log('🚀 Testing BluestoneApps MCP Server modes...\n');

  // Test HTTP mode
  console.log('1. Testing HTTP mode...');
  await testHttpMode();

  console.log('\n2. Testing stdio mode...');
  await testStdioMode();

  console.log('\n🎉 All tests completed!');
}

async function testHttpMode() {
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['build/index.js', '--http'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverStarted = false;

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('  HTTP Server output:', output.trim());

      if (output.includes('BluestoneApps MCP Server running on HTTP')) {
        serverStarted = true;
        console.log('  ✅ HTTP server started successfully!');

        // Test the HTTP endpoint
        import('node:http').then(({ default: http }) => {
          const req = http.request({
            hostname: 'localhost',
            port: 8082,
            path: '/',
            method: 'GET'
          }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              try {
                const response = JSON.parse(data);
                console.log('  ✅ HTTP endpoint response:', response);
                serverProcess.kill();
                resolve();
              } catch (e) {
                console.log('  ❌ Invalid JSON response:', data);
                serverProcess.kill();
                resolve();
              }
            });
          });

          req.on('error', (error) => {
            console.log('  ❌ HTTP request error:', error.message);
            serverProcess.kill();
            resolve();
          });

          req.end();
        });
      }
    });

    serverProcess.on('error', (error) => {
      console.log('  ❌ HTTP server error:', error.message);
      resolve();
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverStarted) {
        console.log('  ❌ HTTP server failed to start within 10 seconds');
        serverProcess.kill();
        resolve();
      }
    }, 10000);
  });
}

async function testStdioMode() {
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['build/index.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverStarted = false;

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('  Stdio Server output:', output.trim());

      if (output.includes('BluestoneApps MCP Server successfully connected')) {
        serverStarted = true;
        console.log('  ✅ Stdio server started successfully!');

        // Test basic MCP functionality
        const testRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list'
        };

        serverProcess.stdin.write(JSON.stringify(testRequest) + '\n');

        let responseBuffer = '';
        serverProcess.stdout.on('data', (data) => {
          responseBuffer += data.toString();

          if (responseBuffer.includes('"jsonrpc"')) {
            console.log('  ✅ MCP tools/list response received');
            serverProcess.kill();
            resolve();
          }
        });

        // Timeout for response
        setTimeout(() => {
          console.log('  ❌ No MCP response within 5 seconds');
          serverProcess.kill();
          resolve();
        }, 5000);
      }
    });

    serverProcess.on('error', (error) => {
      console.log('  ❌ Stdio server error:', error.message);
      resolve();
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverStarted) {
        console.log('  ❌ Stdio server failed to start within 10 seconds');
        serverProcess.kill();
        resolve();
      }
    }, 10000);
  });
}

// Run the tests
testServerModes().catch(console.error);
