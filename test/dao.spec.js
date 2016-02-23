'use strict';

var mongoose = require('mongoose');
var	UserDao = require('../dao/userDao');
var	BillDao = require('../dao/billDao');
mongoose.connect('mongodb://localhost/nodejs-test');

describe.skip('userDao tests', function(){
	var userDao;
	beforeEach(function(){
		userDao = new UserDao();
	});
	
	it('add user', function(){
		var obj = { email: 'test20130814@126.com', password: '123' };
		userDao.save(obj).then(function(data){
			console.log('success: '+data);
		}, function(error){
			console.log('error: '+error);
		});
	});

	it('check login', function(){
		userDao.checkLogin('test20130814@126.com', '13').then(function(data){
			console.log('success: '+data);
		}, function(error){
			console.log('error: '+error);
		});
	});
	
	it('remove user', function(){
		userDao.findOneAndRemove({ email: 'test20130814'}).then(function(data){
			console.log('success: '+data);
		}, function(error){
			console.log('error: '+error);
		});
	});
	
	it('modify user', function(done){
		userDao.update({_id:'562c6a1e3257dbf41149cfc6',email:'1@abc.com'}, 
			{ nickname: 'ert', avatar: 'http://www.qqya.com/qqyaimg/allimg/100529/1_100529165618_29.jpg'})
		userDao.modify('56063fbc772c0dc806e3ada2', 
			{ nickname: 'yui', avatar: 'http://www.qqya.com/qqyaimg/allimg/100529/1_100529165617_11.jpg' })
		.then(function(data){
			console.log('success: ');
			console.log(data);
		})
		.catch(function(error){
			console.log('error: ');
			console.log(error);
		});
		done();
	});
	
});


describe('billDao tests', function(){
	var userDao, billDao;
	beforeEach(function(){
		userDao = new UserDao();
		billDao = new BillDao();
	});

	it('add bill', function(){
		var obj = {  name: 'bus', price: 1.2, detail: 'B11', tag: '4'};
		var user;
		userDao.findOne({ email: 'test20130814@126.com' })
		.then(function(data){
			user = data;
			obj.host = user;
			return billDao.save(obj);
		})
		.then(function(bill){
			return userDao.addBill({ email: 'test20130814@126.com' }, bill);
		})
		.then(function(result){
			console.log('result: '+result);
		})
		.catch(function(error){
			console.log('error: '+error);
		});
		
	});

	it('query bill', function(){
		userDao.findOne({ email: 'test20130814@126.com' }).then(function(data){
			billDao.find({ host:data }).then(function(data){
				console.log('success: '+data);
			}, function(error){
				console.log('error: '+error);
			});
		}, function(error){
			console.log('error: '+error);
		});
	});

	
	it('update bill', function(){
		billDao.update({'detail':'B10'},{'detail':'B10(h-y)'}).then(function(data){
			console.log('success: '+data);
		}, function(error){
			console.log('error: '+error);
		});
	});
	
	
	it('find any bill', function(){
		billDao.costOfDate('5608aced61150c8848f0b815').then(function(data){
			console.log('result');
			console.log(data);
		}, function(error){
			console.log('error: '+error);
		});
	});


	it('costTotal', function(){
		billDao.costOfDay('562c6a6d3257dbf41149cfc7', '','2016-01-05').then(function(data){
			for(let a of data){
				console.log('date: '+a.date);
				console.log('summary: '+a.summary);
				for(let b of a.desc){
					console.log(b.name);
				}
			}
		}, function(error){
			console.log(error);
		});
	});

	it('costCount', function(){
		billDao.costCount('5698a8853dba99bc4b25a095').then((data)=>{
			for(let a of data){
				console.log(a);
			}
		}, console.err);
	});

  it('costTag', function() {
    billDao.costOfTopTag('5698a8853dba99bc4b25a095').then((data)=>{
      console.log(data);
    }, console.err)
  });

  it('costOfTopTag', function() {
  	billDao.costOfTopTag('562c6a6d3257dbf41149cfc7').then((data) => {
  	  console.log(data);
  	}, (error) => {
  		console.log(error);
  	});
  });

  it.only('costOfMonth', function(done) {
  	billDao.costOfMonth('562c6a6d3257dbf41149cfc7').then((data) => {
  	  //console.log(data);
  	  for ( var result of data ) {
  	  	console.log(result.month + ' ' + result.summary);
  	  	for ( var summary of result.tag ) {
  	  		console.log(summary);
  	  	}
  	  }
  	  done();
  	}, (error) => {
  		console.log(error);
  		done();
  	});
  });
});
