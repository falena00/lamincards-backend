//  VERSIONE AGGIORNATA PER USARE SUPABASE
import express from 'express';
import cors from 'cors';
import supabase from './supabase.js'; // Supabase client

console.log("Eseguendo index.js...");
const app = express();
const port = 3001;
import bcrypt from 'bcrypt'; // Importa bcrypt per la gestione delle password

app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

// Route di test
app.get('/', (req, res) => {
  res.send('Backend Lamincards attivo!');
});
// REGISTRAZIONE UTENTE
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  try {
    // Controlla se l'utente esiste già
    const check = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (check.data.length > 0) {
      return res.status(409).json({ message: 'Utente già esistente' });
    }

    // Hasher password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserisce l'utente
    const { error } = await supabase
      .from('users')
      .insert([
        {
          email,
          username,
          password: hashedPassword
        }
      ]);

    if (error) throw error;

    res.status(201).json({ message: 'Utente registrato correttamente' });

  } catch (err) {
    console.error('Errore nella registrazione:', err);
    res.status(500).json({ message: 'Errore nella registrazione' });
  }
});
// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Cerca l'utente tramite Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Account non trovato, Registrati ora!' });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Password errata' });
    }

    // ✅ Login riuscito
    res.json({
      userid: user.userid,
      username: user.username,
      email: user.email,
    });

  } catch (err) {
    console.error("Errore nel login:", err.message);
    res.status(500).send("Errore nel server");
  }
});



// Route per vedere tutte le serie
app.get('/series', async (req, res) => {
  try {
    console.log('Chiamata GET /series ricevuta');

    const { data, error } = await supabase.from('series').select('*');

    if (error) {
      console.error("Errore nella query Supabase:", error);
      return res.status(500).json({ errore: error.message });
    }

    console.log("Serie trovate:", data);
    res.json(data);
  } catch (err) {
    console.error("Errore generale:", err.message);
    res.status(500).send("Errore nel recupero delle serie");
  }
});


//  Route per vedere una serie dettaglio
app.get('/series/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('setid', id)
    .single();

  if (error) {
    console.error('Errore Supabase /series/:id:', error.message);
    return res.status(500).send('Serie non trovata');
  }
  res.json(data);
});

// Route per ottenere tutte le carte
app.get('/cards', async (req, res) => {
  const { data, error } = await supabase.from('cards').select('*');
  if (error) {
    console.error('Errore Supabase /cards:', error.message);
    return res.status(500).send('Errore nel recupero delle carte');
  }
  res.json(data);
});

// Route per ottenere tutte le carte di una specifica serie
app.get('/cards/:id', async (req, res) => {
  const setId = req.params.id;
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('setid', setId)
    .order('numero', { ascending: true });
  if (error) {
    console.error('Errore Supabase /cards/:id:', error.message);
    return res.status(500).send('Errore nel recupero delle carte della serie');
  }
  res.json(data);
});

// Route per ottenere una carta di una specifica serie
app.get('/cards/:setid/:cardid', async (req, res) => {
  const { setid, cardid } = req.params;
  try {
    const result = await supabase
      .from('cards')
      .select('*')
      .eq('setid', setid)
      .eq('cardid', cardid)
      .single();

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (err) {
    console.error('Errore nel recupero della carta:', err);
    res.status(500).send('Errore nel recupero della carta');
  }
});


// Route per ottenere la collezione di un utente specifico
app.get('/user_cards/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  const { data, error } = await supabase
    .from('user_cards')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Errore Supabase /user_cards:', error.message);
    return res.status(500).send('Errore nel recupero della collezione utente');
  }
  res.json(data);
});

// Route per aggiungere o aggiornare una carta nella collezione utente
app.post('/user_cards', async (req, res) => {
  const { user_id, card_id, status, quantity } = req.body;

  try {
    const { data: existing, error: checkError } = await supabase
      .from('user_cards')
      .select('*')
      .eq('user_id', user_id)
      .eq('card_id', card_id);

    if (checkError) throw checkError;

    if (existing.length > 0) {
      const { error: updateError } = await supabase
        .from('user_cards')
        .update({ status, quantity })
        .eq('user_id', user_id)
        .eq('card_id', card_id);

      if (updateError) throw updateError;
      res.send('Carta aggiornata correttamente');
    } else {
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert([{ user_id, card_id, status, quantity }]);

      if (insertError) throw insertError;
      res.send('Carta aggiunta correttamente');
    }
  } catch (err) {
    console.error('Errore Supabase POST /user_cards:', err.message);
    res.status(500).send('Errore nella gestione della carta');
  }
});

// POST /update-user
app.post('/update-user', async (req, res) => {
  const { userid, email, password } = req.body;

  try {
    // Costruisci i campi da aggiornare dinamicamente
    const updates = {};
    if (email) updates.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.password = hashed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nessun campo da aggiornare' });
    }

    // Esegui l'update su Supabase
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('userid', userid)
      .select()
      .single();

    if (error) {
      console.error("Errore Supabase:", error.message);
      return res.status(500).json({ message: 'Errore durante l\'aggiornamento' });
    }

    // Ritorna l'utente aggiornato (senza password!)
    const { password: _, ...userWithoutPassword } = data;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Errore generale:", err.message);
    res.status(500).json({ message: 'Errore nel server' });
  }
});


// Avvia il server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
