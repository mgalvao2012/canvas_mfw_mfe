const express = require('express');
const path = require('path');
const { seed, findByAccountId } = require('./db');

// Toda configuração vem do .env (ver .env.example)
const required = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`Variável ${name} ausente. Defina no .env (ver .env.example).`);
    process.exit(1);
  }
  return v;
};

const PORT = required('PORT');
// Lista separada por vírgula; aceita host sem esquema (assume https) e remove barra final
const SF_ORIGIN = required('SF_ORIGIN')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean)
  .map((s) => (/^https?:\/\//.test(s) ? s : `https://${s}`))
  .join(',');

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  const ancestors = ["'self'", ...SF_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)];
  res.setHeader('Content-Security-Policy', `frame-ancestors ${ancestors.join(' ')}`);
  next();
});

console.log(`SQLite: ${seed()} contas financeiras carregadas`);

app.get('/api/financial-accounts', (req, res) => {
  const { accountId } = req.query;
  if (!accountId || typeof accountId !== 'string') {
    return res.status(400).json({ error: 'accountId é obrigatório' });
  }
  res.json({ accountId, financialAccounts: findByAccountId(accountId) });
});

// Expõe somente a origem do Salesforce ao front (não é segredo)
app.get('/config.json', (_req, res) => res.json({ sfOrigin: SF_ORIGIN }));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`MFE em http://localhost:${PORT}`));
