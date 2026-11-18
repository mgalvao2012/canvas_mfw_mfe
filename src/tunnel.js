// Expõe a porta local via HTTPS usando o cloudflared.
// Config via .env: PORT (obrigatório), TUNNEL_NAME (opcional: túnel nomeado já criado).
// Sem TUNNEL_NAME, usa quick tunnel (URL *.trycloudflare.com nova a cada execução, sem conta).
const { spawn } = require('child_process');

const port = process.env.PORT;
if (!port) {
  console.error('Variável PORT ausente. Defina no .env.');
  process.exit(1);
}

const name = process.env.TUNNEL_NAME;
const args = name
  ? ['tunnel', 'run', name]
  : ['tunnel', '--url', `http://localhost:${port}`];

const child = spawn('cloudflared', args, { stdio: 'inherit' });
child.on('error', (e) => {
  console.error(e.code === 'ENOENT' ? 'cloudflared não encontrado no PATH (brew install cloudflared).' : e.message);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
