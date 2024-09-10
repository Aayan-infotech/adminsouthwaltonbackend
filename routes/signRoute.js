
const express = require('express');
const router = express.Router();
const signController = require('../controllers/signController');

router.post('/save', signController.saveSignature);
router.get('/:userId', signController.getSignature);
router.get('/', signController.getAllSignatures); //getAll
router.delete(':userId', signController.deleteSignature);
router.get('/image/:userId', signController.getSignatureImage);


module.exports = router;
