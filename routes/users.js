const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/users');

// Authenticate
// router.post('/authenticate', (req, res, next) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   var user = { id: 123, name: 'rahul' };
//   const token = jwt.sign(user, config.secret, {
//     expiresIn: 604800 // 1 week
//   });

//   res.json({ token: 'JWT ' + token });
// });


router.post('/authenticate', (req, res) => {
  var json = req.body;
  var username = json.username;

  User.findOne({ username: username }, (err, user) => {
      if(err || !user){
          res.json({status: "F", message: "Invalid Credentials"});
      }

      user.comparePassword(json.password, function(err, isMatch) {
          if (err){
              res.json({status: "F", message: "Invalid Credentials"});
          }

          if(isMatch){
              const token = jwt.sign(user.toJSON(), config.secret, {
                  expiresIn: 604800 // 1 week
              });

              res.json({
                  success: true,
                  token:'JWT ' + token,
                  user: {
                      id: user._id,
                      name: user.name,
                      username: user.username,
                      email: user.email
                  }
              });
          } else{
              return res.json({success: false, msg: 'Wrong password'});
          }

         
          // res.json({password:json.password, result:isMatch}); 
      });

  });

});

// Profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.json({ user: 'success' });
});



//get users and their roles
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) {
      res.json({ status: "F", message: "Unable to retrieve users" });
    }
    if (users) {
      res.json({ users: users, status: "S" });
    }
  });
});

//get a user by id
router.get('/:userId', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  User.findById(req.params.userId, (err, user) => {
    if (err) {
      res.json({ status: "F", message: "Unable to retrieve user" });
    }
    if (user) {
      res.json({ user: user, status: "S" });
    }
  });
});


//create a new user
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  var user = new User(req.body);
  user.save((err) => {
    if (err)
      res.send({ error: err, status: 'F' });
    res.json({ message: 'user created !', status: 'S', user: user.id });
  });
});

//edit a user
router.put('/:userId', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  var json = req.body;
  var userId = req.params.userId;

  User.findById({ _id: userId }, (err, user) => {
    if (err) {
      res.send({ error: err, status: 'F' });
    } else {
      for (var key in req.body) {
        user[key] = json[key];
      }

      user.save((err) => {
        if (err) {
          res.send({ error: err, status: 'F' });
        } else {
          res.send({ message: 'user updated !', status: 'S' });
        }
      });
    }
  });
});

//remove a user
router.delete('/:userId', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  User.remove({ _id: req.params.userId }, (err) => {
    if (err) {
      res.send({ error: err, status: 'F' });
    }

    res.send({ status: 'S', message: "User Deleted" });
  });
});


module.exports = router;
