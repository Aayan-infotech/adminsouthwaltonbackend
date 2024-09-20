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


const uploadMultiple = upload.array('images', 10); // Adjust the limit as needed


router.get('/', damageController.getDamages);
router.get('/:id', damageController.getDamageById); 
router.post('/add', uploadMultiple, damageController.createDamage); 
router.put('/:id', uploadMultiple, damageController.updateDamage); 
router.delete('/:id', damageController.deleteDamage);
router.post('/:id/process-refund', damageController.processRefund);

module.exports = router;
