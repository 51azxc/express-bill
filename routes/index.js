'use strict';

var express = require('express');
var router = express.Router();
var UserDao = require('../dao/UserDao');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../utils/config.json');

var userDao = new UserDao();

/* GET home page. */

/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/partials/:filename', function(req, res){
  var name = req.params.filename || 'show';
  res.render('partials/' + name);
});
*/
router.post('/signin', function(req, res, next){
	var email = req.body.email || '';
    var password = req.body.password || '';
	if( email == '' || password == '' ){
		res.status(405).json({ 
			success: false, 
			message: 'error parameters'
		});
	}else{
		userDao.findOne({ 'email': email })
		.then(function(user){
			if(user.comparePassword(password)){
				var token = jwt.sign({ id: user._id}, config.secret, { expiresIn: "2 days" });
				res.json({
					success: true,
					token: token
				});
			}else{
				res.json({
					success: false,
					message: 'Invalid email or password'
				});
			}
		}, function(error){
			res.status(500).json({ 
				success: false, 
				message: error.message
			});
		});
	}
});

router.post('/signup', function(req, res, next){
	var email = req.body.email || '';
    var password = req.body.password || '';
	if( email == '' || password == '' ){
		res.status(405).json({ 
			success: false, 
			message: 'error parameters'
		});
	}else{
		userDao.save({ 'email': email, 'password': password })
		.then(function(data){
			res.json({
				success: true,
				message: 'sign up successful'
			});
		}, function(error){
			res.status(500).json({ 
				success: false, 
				message: error.message
			});
		});
	}
});

router.post('/checkEmail', function(req, res, next){
	var email = req.body.email || '';
	userDao.findOne({ 'email': email })
		.then(function(user){
			res.json({ exists: true });
		}, function(error){
			res.json({ exists: false });
		});
});

module.exports = router;
