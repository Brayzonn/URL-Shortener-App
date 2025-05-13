const router = require("express").Router();
const {ensureAuthenticated} = require('../config/auth');

const { userdash, landing, getuRL, submitUrl, redirectNonUserShortenedUrl, fetchNonUserLinkData, shortenLinkForNonUser, signup, signin } = require("../controllers/authcontroller");

router.get('/', landing) 

router.post('/api/signup', signup)
router.post('/api/signin', signin)

router.post("/api/user/submiturl", ensureAuthenticated, submitUrl)
router.get('/api/user/dashboard', ensureAuthenticated, userdash)
router.get('/a/:urlcode', getuRL)

router.post('/api/submiturl',    shortenLinkForNonUser)
router.get('/api/getfreeurl',    fetchNonUserLinkData) 
router.get('/b/:nonuserurlcode', redirectNonUserShortenedUrl)


module.exports = router;
