#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test the MCP server
async function testServer() {
  console.log('🚀 Testing BluestoneApps MCP Server...\n');

  try {
    // Start the server
    const serverProcess = spawn('node', ['build/index.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Track if server started successfully
    let serverStarted = false;

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('Server output:', output);

      if (output.includes('BluestoneApps MCP Server successfully connected')) {
        serverStarted = true;
        console.log('✅ Server started successfully!');

        // Test basic functionality
        testBasicFunctionality(serverProcess);
      }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverStarted) {
        console.error('❌ Server failed to start within 10 seconds');
        serverProcess.kill();
      }
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function testBasicFunctionality(serverProcess) {
  console.log('\n📋 Testing basic functionality...');

  // Test list_available_examples tool
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'list_available_examples',
      arguments: {
        category: 'all',
        format: 'json'
      }
    }
  };

  serverProcess.stdin.write(JSON.stringify(testRequest) + '\n');

  let responseBuffer = '';

  serverProcess.stdout.on('data', (data) => {
    responseBuffer += data.toString();

    // Look for complete JSON response
    const lines = responseBuffer.split('\n');
    for (const line of lines) {
      if (line.trim() && line.includes('"jsonrpc"')) {
        try {
          const response = JSON.parse(line);
          console.log('✅ Received response:', response);

          // Kill server after successful test
          setTimeout(() => {
            serverProcess.kill();
            console.log('\n🎉 Test completed successfully!');
          }, 1000);

          return;
        } catch (e) {
          // Continue reading
        }
      }
    }
  });

  // Timeout for response
  setTimeout(() => {
    console.error('❌ No response received within 5 seconds');
    serverProcess.kill();
  }, 5000);
}

// Run the test
testServer();
