const express = require('express');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
    process.exit(1);
  }
  console.log('Banco de dados conectado em', dbPath);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      assunto TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      message_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.all(`PRAGMA table_info(contacts)`, (err, rows) => {
    if (err) {
      console.error('Erro ao verificar esquema do banco de dados:', err.message);
      return;
    }

    const hasHashColumn = rows.some((row) => row.name === 'message_hash');
    if (!hasHashColumn) {
      db.run(`ALTER TABLE contacts ADD COLUMN message_hash TEXT NOT NULL DEFAULT ''`, (alterErr) => {
        if (alterErr) {
          console.error('Erro ao atualizar esquema do banco de dados:', alterErr.message);
        }
      });
    }
  });
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', (req, res) => {
  const { nome, email, assunto, mensagem } = req.body;

  if (!nome || !email || !assunto || !mensagem) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  const messageHash = crypto.createHash('sha256').update(mensagem).digest('hex');
  const stmt = db.prepare(`INSERT INTO contacts (nome, email, assunto, mensagem, message_hash) VALUES (?, ?, ?, ?, ?)`);
  stmt.run(nome, email, assunto, mensagem, messageHash, function (err) {
    if (err) {
      console.error('Erro ao salvar contato:', err.message);
      return res.status(500).json({ error: 'Erro interno ao salvar a mensagem.' });
    }

    res.json({ success: true, id: this.lastID });
  });
  stmt.finalize();
});

app.get('/api/contacts', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Erro ao recuperar contatos:', err.message);
      return res.status(500).json({ error: 'Erro interno ao buscar contatos.' });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
