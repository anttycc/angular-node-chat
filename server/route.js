const express = require('express');
const userCtrl = require('./controllers/user');
const {upload} = require('./middlewares/fileupload');


const router = express.Router();


router.post('/register', upload, userCtrl.createUser);
router.post('/login', userCtrl.login);


module.exports = router;




