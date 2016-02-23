var request = require("request");
var base_url = "http://localhost:3000/";

var token  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjJjNmE2ZDMyNTdkYmY0MTE0OWNmYzciLCJlbWFpbCI6IjFAYS5'
		   + 'jb20iLCJhdmF0YXIiOiJodHRwOi8vdjEucXpvbmUuY2MvYXZhdGFyLzIwMTQwOC8yMC8xNy8yMy81M2Y0NjhmZjljMzM3NTUwLmpwZyUyMTIwMHgyMDAuanBnIiwibmlja25hbWUiOiIxMjMifQ'
		   + '.H4sQbSNUUMbLJxfekMQqHJR4Rw4t0OIHjt7U7GClKps';


describe('User router test', function(){
/*
	it("returns status code 200", function(done) {
      request.get(base_url+"users/add", function(error, response, body) {
		expect(response.statusCode).toBe(200);
		expect(body).toBe("add user");
		done();
	  });
    });

    it("add user", function(done){
    	var user = { email: '1@a.com', password: '2' };
		var opt = {
			headers: {'Content-Type':'application/json'},
			url: base_url+"users/login",
			method: 'POST',
			json: true,
			body: user
		};
    	request(opt, function(error, response, body){
    		console.log(response.statusCode);
    		console.log(body);
    		done();
    	});
    });
	*/
	it("modify user", function(done){
    	var user = { nickname: 'qwe', avatar: 'http://www.qqya.com/qqyaimg/allimg/100529/1_100529165617_3.jpg'};
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"api/users/save",
			method: 'PUT',
			json: true,
			body: user
		};
    	request(opt, function(error, response, body){
    		console.log(response.statusCode);
    		console.log(body);
    		done();
    	});
    })
/*
	it("sign in", function(done){
		var user = { email: '1@a.cn', password: '1'};
		var opt = {
			headers: {'Content-Type':'application/json'},
			url: base_url+"signin",
			method: 'POST',
			json: true,
			body: user,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});

	it("save user", function(done){
		var user = { email: '1@a.cn', password: '1', avatar: '1.png'};
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"users/save",
			method: 'PUT',
			json: true,
			body: user,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});

	it("get user", function(done){
		var opt = {
			headers: { 'x-access-token': token },
			url: base_url+"users/self",
			method: 'GET'
		};
    	request(opt, function(error, response, body){
    		console.log(response.statusCode);
    		console.log(body);
    		done();
    	});
    });
*/
});

describe('Billl router test', function(done){
/*
	it('add a bill', function(){
		var obj = {  name: 'bus', price: 1.2, detail: 'B11', tag: '4'};
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"bills/add",
			method: 'POST',
			json: true,
			body: obj,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});
	
	it('modify bill', function(done){
		var obj = {  name: 'bus', price: 2, detail: 'B10', tag: '4'};
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"bills/modify/561f71a6346050341bf1f89c",
			method: 'PUT',
			body: obj,
			json: true,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});


	it('delete bills', function(done){
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"bills/delete/561f71a6346050341bf1f89c",
			method: 'DELETE',
			json: true,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});

	it('find bills', function(done){
		var obj = {  name: 'bus', price: 2, detail: 'B11', tag: '4'};
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"bills/find",
			method: 'GET',
			body: obj,
			json: true,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});

	it('bill of today', function(done){
		var opt = {
			headers: {'Content-Type':'application/json', 'x-access-token': token},
			url: base_url+"bills/day",
			method: 'GET',
			json: true,
			timeout: 60*60*1000
		};
		request(opt, function(error, response, body){
			console.log(body);
			done();
		});
	});
	
	*/
});

