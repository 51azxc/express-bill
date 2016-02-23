'use strict';

var mongoose = require('mongoose'),
	Q = require('Q');

class GenericDao {
	constructor(schema){
		this.Schema = schema;
	}
	save(obj){
		var deferred = Q.defer();
		var schema = new this.Schema(obj);
		schema.save(function(err){
			if (err) deferred.reject(err);
			deferred.resolve(schema._id);
		});
		return deferred.promise;
	}
	modify(id ,obj){
		var deferred = Q.defer();
		var update = obj;
		if (update._id) {
			delete update._id;
		}
		this.Schema.update({ _id: id }, { $set: update }, function(err, raw){
			if(err) deferred.reject(err);
			deferred.resolve(raw);
		});
		return deferred.promise;
	}
	remove(id){
		var deferred = Q.defer();
		this.Schema.remove({ _id:id }, function(err){
			if(err) deferred.reject(err);
			deferred.resolve();
		});
		return deferred.promise;
	}
	findOne(obj){
		var deferred = Q.defer();
		this.Schema.findOne(obj, function(err, schema){
			if(err) deferred.reject(err);
			if (schema){
				deferred.resolve(schema);
			}else{
				deferred.reject('not found');
			}
		});
		return deferred.promise;
	}
	find(obj){
		var deferred = Q.defer();
		this.Schema.find(obj, function(err, schema){
			if(err) deferred.reject(err);
			if (schema){
				deferred.resolve(schema);
			}else{
				deferred.reject('not found');
			}
			
		});
		return deferred.promise;
	}
	findOneAndUpdate(query, obj){
		var deferred = Q.defer();
		var conditions = query;
		var update = obj;
		if (update._id) {
			delete update._id;
		}
		this.Schema.findOneAndUpdate(conditions, update, function(err, schema){
			if(err){
				console.log(err);
				deferred.reject(err);
			} 
			if (schema){
				deferred.resolve(schema);
			}else{
				deferred.reject('not found');
			}
		});
		return deferred.promise;
	}
	findOneAndRemove(obj){
		var deferred = Q.defer();
		this.Schema.findOneAndRemove(obj, function(err, schema){
			if(err) deferred.reject(err);
			if (schema){
				deferred.resolve(schema);
			}else{
				deferred.reject('not found');
			}
		});
		return deferred.promise;
	}
	update(query, obj){
		var update = obj;
		if (update._id) {
			delete update._id;
		}
		return this.findOneAndUpdate(query, { $set: update });
	}
	
	aggregate(list){
		var deferred = Q.defer();
		this.Schema.aggregate(list, function(err, results){
			if(err) deferred.reject(err);
			if (results){
				deferred.resolve(results);
			}else{
				deferred.reject('not found');
			}
			
		});
		return deferred.promise;
	}
}

module.exports = GenericDao;