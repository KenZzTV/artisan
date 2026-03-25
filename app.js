var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2')
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var artisanRouter = require('./routes/artisan');
var listeArtisansRouter = require('./routes/listeartisans');
var errorRouter = require('./routes/404');

const { error } = require('console');

var app = express();

app.use(cors())

// ... tes imports ...

var app = express();
app.use(cors());

// Configuration dynamique : Railway en ligne OR Localhost sur ton PC
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3307,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'test'
});

// Petite vérification de connexion au démarrage
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
        return;
    }
    console.log('Connecté à la base de données MySQL !');
});

// 1. Middlewares d'abord
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 2. TES ROUTES API (Juste ici)
app.get('/api/artisans', (req, res) => {
    db.query('SELECT * FROM data', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/artisans/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM data WHERE ID = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: "Artisan non trouvé" });
        }
    });
});

// Route pour enregistrer le formulaire de contact
app.post('/api/contact', (req, res) => {
    // On récupère les données envoyées par le formulaire React
    const { nom, email, message } = req.body;
    
    // Requête SQL pour insérer dans TA table "formulaire"
    const query = "INSERT INTO formulaire (nom, email, message) VALUES (?, ?, ?)";
    
    db.query(query, [nom, email, message], (err, result) => {
        if (err) {
            console.error("Erreur SQL lors de l'insertion :", err);
            return res.status(500).json({ error: "Erreur lors de l'enregistrement" });
        }
        
        // Si ça marche, on renvoie une réponse positive à React
        console.log("Nouveau message reçu de :", nom);
        res.json({ success: true, message: "Données insérées avec succès !" });
    });
});

// 3. Les routers de fichiers externes (à la fin)
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;