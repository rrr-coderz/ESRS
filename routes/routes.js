var express = require('express')
var router = express.Router();
var userRoute = require('./users')


router.get('/', (req, res) => {
    res.send('Success');
})

router.use('/users', userRoute);


module.exports = router;