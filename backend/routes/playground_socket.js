const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLAYGROUND_DIR = path.join(__dirname, '../temp_playground');
const isWin = process.platform === 'win32';

// Ensure base playground directory exists
if (!fs.existsSync(PLAYGROUND_DIR)) {
  fs.mkdirSync(PLAYGROUND_DIR, { recursive: true });
}

function compile(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message || stdout);
      } else {
        resolve();
      }
    });
  });
}

function handlePlaygroundSocket(ws) {
  let childProcess = null;
  let runDir = null;
  let timeoutId = null;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (childProcess) {
      try {
        childProcess.kill();
      } catch (e) {}
      childProcess = null;
    }
    if (runDir) {
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch (e) {}
      runDir = null;
    }
  };

  ws.on('message', async (message) => {
    try {
      const payload = JSON.parse(message);
      const { type } = payload;

      if (type === 'start') {
        const { language, code } = payload;
        if (!language || !code) {
          ws.send(JSON.stringify({ type: 'error', data: 'Language and code are required.' }));
          ws.close();
          return;
        }

        const normLang = language.toLowerCase();
        const runId = `run_interactive_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        runDir = path.join(PLAYGROUND_DIR, runId);
        fs.mkdirSync(runDir, { recursive: true });

        // Set safety execution timeout of 30 seconds for interactive session
        timeoutId = setTimeout(() => {
          ws.send(JSON.stringify({ type: 'stderr', data: '\nExecution Timeout: 30 seconds limit reached.\n' }));
          cleanup();
          ws.close();
        }, 30000);

        try {
          if (normLang === 'python') {
            const filePath = path.join(runDir, 'main.py');
            fs.writeFileSync(filePath, code, 'utf8');

            childProcess = spawn('python', ['main.py'], { cwd: runDir });
          } else if (normLang === 'java') {
            const filePath = path.join(runDir, 'Main.java');
            fs.writeFileSync(filePath, code, 'utf8');

            ws.send(JSON.stringify({ type: 'stdout', data: 'Compiling Java program...\n' }));
            await compile('javac Main.java', runDir);

            childProcess = spawn('java', ['Main'], { cwd: runDir });
          } else if (normLang === 'c') {
            const filePath = path.join(runDir, 'main.c');
            fs.writeFileSync(filePath, code, 'utf8');

            ws.send(JSON.stringify({ type: 'stdout', data: 'Compiling C program...\n' }));
            const compileCmd = isWin ? 'gcc main.c -o main.exe' : 'gcc main.c -o main';
            await compile(compileCmd, runDir);

            const executable = path.join(runDir, isWin ? 'main.exe' : 'main');
            childProcess = spawn(executable, [], { cwd: runDir });
          } else if (normLang === 'cpp') {
            const filePath = path.join(runDir, 'main.cpp');
            fs.writeFileSync(filePath, code, 'utf8');

            ws.send(JSON.stringify({ type: 'stdout', data: 'Compiling C++ program...\n' }));
            const compileCmd = isWin ? 'g++ main.cpp -o main.exe' : 'g++ main.cpp -o main';
            await compile(compileCmd, runDir);

            const executable = path.join(runDir, isWin ? 'main.exe' : 'main');
            childProcess = spawn(executable, [], { cwd: runDir });
          } else {
            ws.send(JSON.stringify({ type: 'error', data: `Unsupported language: ${language}` }));
            ws.close();
            cleanup();
            return;
          }

          // Handle process output
          childProcess.stdout.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
          });

          childProcess.stderr.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'stderr', data: data.toString() }));
          });

          childProcess.on('error', (err) => {
            ws.send(JSON.stringify({ type: 'stderr', data: `Execution error: ${err.message}\n` }));
            cleanup();
            ws.close();
          });

          childProcess.on('close', (code) => {
            ws.send(JSON.stringify({ type: 'exit', code }));
            cleanup();
            ws.close();
          });

        } catch (compileErr) {
          ws.send(JSON.stringify({ type: 'compile_error', data: compileErr.toString() }));
          cleanup();
          ws.close();
        }

      } else if (type === 'stdin') {
        const { data } = payload;
        if (childProcess && childProcess.stdin && childProcess.stdin.writable) {
          childProcess.stdin.write(data);
        }
      }

    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', data: `Invalid message payload: ${err.message}` }));
    }
  });

  ws.on('close', () => {
    cleanup();
  });
}

module.exports = { handlePlaygroundSocket };
