const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Inizializza l'app Express
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configura la connessione a PostgreSQL
const pool = new Pool({
  user: 'postgres',        // Cambia se usi un altro utente
  host: 'localhost',
  database: 'lamincards',
  password: 'Cavallos.00',  // ← Cambia con la password scelta durante l'installazione
  port: 5432,
});

// Route di test
app.get('/', (req, res) => {
  res.send('Backend Lamincards attivo!');
});

// Route per vedere tutte le serie
app.get('/series', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM series');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Errore nel recupero delle serie');
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
