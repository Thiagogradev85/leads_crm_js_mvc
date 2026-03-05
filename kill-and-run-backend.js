// kill-and-run-backend.js
// Mata qualquer processo na porta 8000 e inicia o backend
import { execSync } from "child_process";

try {
  // Windows: encontra o PID e mata
  const output = execSync('netstat -ano | findstr :8000').toString();
  const lines = output.split('\n').filter(Boolean);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[4];
    if (pid) {
      try {
        execSync(`taskkill /PID ${pid} /F`);
        console.log(`Processo ${pid} na porta 8000 finalizado.`);
      } catch (e) {
        // ignora erro se já foi morto
      }
    }
  }
} catch (e) {
  // Nenhum processo na porta
}

// Inicia o backend normalmente (sem hot reload)
execSync('bun --cwd server run src/index.js', { stdio: 'inherit' });
