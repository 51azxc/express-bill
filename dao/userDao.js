'use strict';

var User = require('../models/user'),
	GenericDao = require('./genericDao');

class UserDao extends GenericDao{
	constructor(){
		super(User);
	}

	checkLogin(email, password){
		return this.findOne({ email:email, password: User.hashPassword(password) });
	}

	checkEmail(email){
		return this.findOne({ email:email });
	}
	
	addBill(id, bill){
		var query = { _id: id };
		return this.findOneAndUpdate(query, { $push: { bills: bill } });
	}

}

module.exports = UserDao;