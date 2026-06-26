const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PLAYGROUND_DIR = path.join(__dirname, '../temp_playground');

// Ensure base playground directory exists
if (!fs.existsSync(PLAYGROUND_DIR)) {
  fs.mkdirSync(PLAYGROUND_DIR, { recursive: true });
}

const isWin = process.platform === 'win32';

// Map frontend language keys to backend configs
const LANG_CONFIG = {
  python: {
    fileName: 'main.py',
    command: 'python main.py'
  },
  c: {
    fileName: 'main.c',
    command: isWin ? 'gcc main.c -o main.exe && main.exe' : 'gcc main.c -o main && ./main'
  },
  cpp: {
    fileName: 'main.cpp',
    command: isWin ? 'g++ main.cpp -o main.exe && main.exe' : 'g++ main.cpp -o main && ./main'
  },
  java: {
    fileName: 'Main.java', // Expect Main class
    command: 'javac Main.java && java Main'
  }
};

// Helper for cloud execution fallback using public Godbolt API
async function runPistonCloud(language, code) {
  try {
    console.log(`Running cloud execution fallback for language: ${language}`);
    
    // Map language keys to Godbolt compiler IDs
    const compilerMap = {
      'c': 'g122',
      'cpp': 'g122',
      'python': 'python312',
      'java': 'java1302'
    };
    
    const compilerId = compilerMap[language.toLowerCase()];
    if (!compilerId) {
      throw new Error(`Unsupported cloud execution fallback language: ${language}`);
    }

    // Prepare code for Godbolt:
    // If Java, remove "public" modifier from "class Main" if present to avoid filename mismatch compilation error on Godbolt
    let processedCode = code;
    if (language.toLowerCase() === 'java') {
      processedCode = code.replace(/\bpublic\s+class\s+Main\b/, 'class Main');
    }

    const response = await fetch(`https://godbolt.org/api/compiler/${compilerId}/compile`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: processedCode,
        options: {
          userArguments: '',
          compilerOptions: {
            executorRequest: true
          },
          filters: {
            execute: true
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Godbolt API returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.didExecute) {
      // Successful compile and run
      const stdoutText = (data.stdout || []).map(item => item.text).join('\n') + '\n';
      const stderrText = (data.stderr || []).map(item => item.text).join('\n') + '\n';
      return {
        success: true,
        stdout: stdoutText,
        stderr: stderrText,
        runSource: 'cloud'
      };
    } else {
      // Compile or build failed
      let stderrText = '';
      if (data.buildResult && data.buildResult.stderr) {
        stderrText = data.buildResult.stderr.map(item => item.text).join('\n') + '\n';
      } else if (data.stderr) {
        stderrText = data.stderr.map(item => item.text).join('\n') + '\n';
      }
      
      // Clean up ANSI escape sequences (colors, etc.)
      stderrText = stderrText.replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?g/g, '');
      stderrText = stderrText.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');

      return {
        success: false,
        error: 'COMPILE_ERROR',
        stderr: stderrText,
        runSource: 'cloud'
      };
    }
  } catch (err) {
    console.error('Godbolt cloud execution failed:', err);
    return {
      success: false,
      error: 'CLOUD_RUN_ERROR',
      stderr: `Cloud Compiler Error: ${err.message}`
    };
  }
}

// ================= RUN CODE ENDPOINT =================
router.post('/run', async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ message: 'Language and code are required.' });
  }

  const normalizedLang = language.toLowerCase();
  const config = LANG_CONFIG[normalizedLang];

  if (!config) {
    return res.status(400).json({ message: `Unsupported language: ${language}` });
  }

  // Create isolated running directory
  const runId = `run_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const runDir = path.join(PLAYGROUND_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const filePath = path.join(runDir, config.fileName);
  fs.writeFileSync(filePath, code, 'utf8');

  // Execute child process
  exec(
    config.command,
    {
      cwd: runDir,
      timeout: 5000 // 5 seconds timeout limit
    },
    async (error, stdout, stderr) => {
      // Clean up directory immediately after execution completes
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error('Error during runDir cleanup:', cleanupErr);
      }

      if (error) {
        // Handle timeout
        if (error.killed) {
          return res.status(200).json({
            success: false,
            error: 'TIMEOUT',
            stdout: stdout || '',
            stderr: 'Execution Timeout: Limit of 5 seconds exceeded.'
          });
        }

        const errMsg = (error.message || '') + '\n' + (stderr || '');
        const isCompilerMissing = 
          error.code === 127 ||
          error.code === 9009 ||
          errMsg.includes('not recognized') || 
          errMsg.includes('command not found') || 
          errMsg.includes('ENOENT') ||
          errMsg.includes('cannot find the path') ||
          errMsg.includes(': not found');

        if (isCompilerMissing) {
          // Execute via Cloud fallback API
          const cloudResult = await runPistonCloud(language, code);
          if (cloudResult.runSource === 'cloud') {
            return res.status(200).json({
              success: cloudResult.success,
              stdout: cloudResult.stdout || '',
              stderr: cloudResult.stderr || '',
              runSource: 'cloud',
              error: cloudResult.error
            });
          } else {
            // Cloud fallback also failed (e.g. offline), return compiler missing diagnostic
            return res.status(200).json({
              success: false,
              error: 'COMPILER_MISSING',
              stdout: stdout || '',
              stderr: stderr || error.message
            });
          }
        }

        // Return execution / compile error
        return res.status(200).json({
          success: false,
          error: 'EXECUTION_ERROR',
          stdout: stdout || '',
          stderr: stderr || error.message
        });
      }

      // Successful local execution
      res.status(200).json({
        success: true,
        stdout: stdout,
        stderr: stderr,
        runSource: 'local'
      });
    }
  );
});

module.exports = router;
