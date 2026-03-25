const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('liste_artisan');
});

module.exports = router;