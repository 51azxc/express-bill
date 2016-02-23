'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	User = require('../models/user');

var BillSchema = new Schema({
	name: { type: String, trim: true, required: true },
	price: { type: Number,default: 0 },
	detail: String,
	costDate:  { type: Date, default: new Date(), index: true },
	tag: { type: String, enum: '1,2,3,4,5'.split(','), default: '5' },
	images: [ String ],
	host: { type: Schema.Types.ObjectId, ref: 'User' }
});

BillSchema.path('price').validate(function (price) {
   var priceRegex = /^\d+(\.\d{1,2})?$/;
   return priceRegex.test(price);
}, 'Invalid price');

BillSchema.virtual('costDate.year').get(function(){
	return this.costDate.getFullYear();
});

BillSchema.virtual('costDate.month').get(function(){
	return this.costDate.getMonth();
});

BillSchema.virtual('costDate.day').get(function(){
	return this.costDate.getDate();
});

BillSchema.virtual('costDate.weekday').get(function(){
	return this.costDate.getDay();
});

var Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;