const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.resolve(process.env.DB_FILE || '');
if (!process.env.DB_FILE) throw new Error('Variável DB_FILE ausente. Defina no .env.');
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new DatabaseSync(DB_FILE);
const run = (sql) => db.prepare(sql).run();

run(`
  CREATE TABLE IF NOT EXISTS financial_accounts (
    financial_account_number TEXT PRIMARY KEY,
    account_id        TEXT NOT NULL,
    category          TEXT,
    product_name      TEXT,
    modality          TEXT,
    currency_iso_code TEXT,
    status            TEXT,
    amount_type       TEXT,
    amount            REAL,
    main_conditions   TEXT
  )`);
run('CREATE INDEX IF NOT EXISTS idx_fa_account_id ON financial_accounts(account_id)');

// Recarrega o banco a partir do dados.json (idempotente, em transação)
function seed(jsonPath = process.env.DATA_FILE) {
  if (!jsonPath) throw new Error('Variável DATA_FILE ausente. Defina no .env.');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const insert = db.prepare(`
    INSERT INTO financial_accounts
      (financial_account_number, account_id, category, product_name, modality,
       currency_iso_code, status, amount_type, amount, main_conditions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  run('BEGIN');
  try {
    run('DELETE FROM financial_accounts');
    let n = 0;
    for (const { accountId, financialAccounts } of data) {
      for (const f of financialAccounts) {
        insert.run(
          f.financialAccountNumber, accountId, f.category, f.productName, f.modality,
          f.currencyIsoCode, f.status, f.amountType, f.amount, f.mainConditions ?? null
        );
        n++;
      }
    }
    run('COMMIT');
    return n;
  } catch (e) {
    run('ROLLBACK');
    throw e;
  }
}

const byAccount = db.prepare(`
  SELECT financial_account_number AS financialAccountNumber,
         category, product_name AS productName, modality,
         currency_iso_code AS currencyIsoCode, status,
         amount_type AS amountType, amount, main_conditions AS mainConditions
  FROM financial_accounts
  WHERE account_id = ?
  ORDER BY financial_account_number`);

const findByAccountId = (accountId) => byAccount.all(accountId);

module.exports = { db, seed, findByAccountId };
