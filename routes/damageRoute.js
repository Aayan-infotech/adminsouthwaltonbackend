const express = require('express');
const router = express.Router();
const damageController = require('../controllers/damageController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
router.get('/', damageController.getDamages);
router.get('/:id', damageController.getDamageById); // Get by ID route
router.post('/add', upload.single('image'), damageController.createDamage); 
router.put('/:id', upload.single('image'), damageController.updateDamage); 
router.delete('/:id', damageController.deleteDamage);

module.exports = router;
