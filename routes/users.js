'use strict';

var express = require('express'),
  UserDao = require('../dao/userDao'),
  User = require('../models/user'),
  utils = require('../utils/utils.js');

var router = express.Router(),
  userDao = new UserDao();

router.put('/save', utils.upload.single('file'), (req, res) => {
  if (req.user && req.body.user) {
    var user = req.body.user;
    if (user.avatar.indexOf('http') != -1) {
      userDao.findOne({
        _id: req.user.id
      }).then(function (data) {
        if (data.avatar.indexOf('http') < 0) {
          utils.removeFile(data.avatar);
        }
      }, console.err);
    }
    if (req.file) {
      userDao.findOne({
        _id: req.decoded
      }).then(function (data) {
        if (data.avatar.indexOf('http') < 0) {
          utils.removeFile(data.avatar);
        }
      }, console.err);
      user.avatar = req.file.path.replace(/\\/g, '/');
    }
    if (user.password) {
      user.password = User.hashPassword(user.password);
    }
    if (user.avatar == '') {
      delete user.avatar;
    }
    if (user._id) {
      delete user._id;
    }
    if (user.email) {
      delete user.email;
    }
    userDao.modify(req.user.id, user)
      .then(function (data) {
        res.json({
          success: true,
          message: 'save successful'
        });
      }, function (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      });
  }
});

router.get('/me', (req, res) => {
  if (req.user) {
    userDao
      .findOne({
        _id: req.user.id
      })
      .then(function (data) {
        res.json({
          success: true,
          user: data
        });
      }, function (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      });
  } else {
    res.status(500).json({
      success: false,
      message: 'not found'
    });
  }
});

module.exports = router;