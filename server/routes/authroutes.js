const router = require("express").Router();
const {ensureAuthenticated, ensureAdmin} = require('../config/auth');

const { userdash, getuRL, submitUrl, getuRLnonUser, getSubmitUrl, freeSubmitUrl, signup, signin } = require("../controllers/authcontroller");

router.post("/api/user/submiturl", ensureAuthenticated, submitUrl)

router.post('/api/signup', signup)

router.post('/api/signin', signin)

router.get('/api/user/dashboard', ensureAuthenticated, userdash)

router.get('/:urlcode', getuRL)

router.post('/api/submiturl', freeSubmitUrl)

router.get('/api/getfreeurl', getSubmitUrl) 

router.get('/:nonuserurlcode', getuRLnonUser)


module.exports = router;
