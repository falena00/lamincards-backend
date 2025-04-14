const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

console.log("Eseguendo index.js...");
// Inizializza l'app Express
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

// Configura la connessione a PostgreSQL
const pool = new Pool({
  user: 'postgres',        // Cambia se usi un altro utente
  host: 'localhost',
  database: 'Lamincards',
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
    console.log('Chiamata GET /series ricevuta');
    const result = await pool.query('SELECT * FROM series');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nella query /series:', err.message);
    res.status(500).send('Errore nel recupero delle serie');
  }
  
});
// Route per vedere una serie dettaglio
app.get('/series/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM series WHERE setid = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Serie non trovata');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore nel recupero della serie:', err);
    res.status(500).send('Errore nel recupero della serie');
  }
});


// Route per ottenere tutte le carte
app.get('/cards', async (req, res) => {
  try {
    console.log('Chiamata GET /cards ricevuta');
    const result = await pool.query('SELECT * FROM cards');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nella query /cards:', err.message);
    res.status(500).send('Errore nel recupero delle carte');
  }
});
// Route per ottenere tutte le carte di una specifica serie (es. /cards/DB02)
app.get('/cards/:id', async (req, res) => {
  const setId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT * FROM cards WHERE setid = $1',
      [setId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nella query /cards/:id:', err.message);
    res.status(500).send('Errore nel recupero delle carte della serie');
  }
});

// Route per ottenere la collezione di un utente specifico
app.get('/user_cards/:user_id', async (req, res) => {
  const userId = req.params.user_id;  // Estrae l'ID utente dall'URL (es: /user_cards/1)

  try {
    console.log(`Chiamata GET /user_cards/${userId} ricevuta`);

    // Esegue la query per trovare tutte le carte associate a quell'utente
    const result = await pool.query(
      'SELECT * FROM user_cards WHERE user_id = $1',
      [userId]
    );

    // Risponde con i dati in formato JSON
    res.json(result.rows);

  } catch (err) {
    // Se c'è un errore, lo stampa e restituisce errore 500
    console.error('Errore nella query /user_cards:', err.message);
    res.status(500).send('Errore nel recupero della collezione utente');
  }
});

// Route per aggiungere o aggiornare una carta nella collezione di un utente
app.post('/user_cards', async (req, res) => {
  const { user_id, card_id, status, quantity } = req.body;

  try {
    console.log(`Chiamata POST /user_cards ricevuta per user_id=${user_id}, card_id=${card_id}`);

    // Verifica se esiste già una riga con lo stesso utente e carta
    const check = await pool.query(
      'SELECT * FROM user_cards WHERE user_id = $1 AND card_id = $2',
      [user_id, card_id]
    );

    if (check.rows.length > 0) {
      // Se esiste già → aggiorna
      await pool.query(
        'UPDATE user_cards SET status = $1, quantity = $2 WHERE user_id = $3 AND card_id = $4',
        [status, quantity, user_id, card_id]
      );
      res.send('Carta aggiornata correttamente');
    } else {
      // Se non esiste → inserisci
      await pool.query(
        'INSERT INTO user_cards (user_id, card_id, status, quantity) VALUES ($1, $2, $3, $4)',
        [user_id, card_id, status, quantity]
      );
      res.send('Carta aggiunta correttamente');
    }

 } catch (err) {
  console.error('Errore nella POST /user_cards:', err.message);
  console.error('Errore completo:', err); // 👈 aggiunta utile!
  res.status(500).send('Errore nella gestione della carta');
}

});

// Avvia il server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
