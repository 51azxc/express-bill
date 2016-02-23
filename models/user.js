'use strict';

var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema,
	SALT_WORK_FACTOR = 10,
	Bill = require('./bill');

var UserSchema = new Schema({
	email: { type: String, trim: true, required: true, unique: true},
	password:  { type: String, required: true, set: hashPassword },
	nickname: { type: String, trim: true },
	avatar: { type: String, trim: true },
	bills: [{ type: Schema.Types.ObjectId, ref: 'Bill' }]
});

function hashPassword(password){
	var md5 = crypto.createHash('md5');
	md5.update(password);
	return md5.digest('hex');
}

//验证密码
UserSchema.methods.comparePassword = function(candidatePassword){
	return this.password === hashPassword(candidatePassword);
};

UserSchema.methods.toJSON = function(){
	var obj = this.toObject();
	//delete obj._id;
	delete obj.bills;
	delete obj.password;
	delete obj.__v;
	return obj;
};

UserSchema.statics.hashPassword = hashPassword;

//验证邮箱
UserSchema.path('email').validate(function (email) {
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'Invalid email address');

var User = mongoose.model('User', UserSchema);

module.exports = User;