'use strict';

var Bill = require('../models/bill'),
	mongoose = require('mongoose'),
	GenericDao = require('./genericDao'),
  utils = require('../utils/utils'),
	config = require('../utils/config.json');

class BillDao extends GenericDao{
	constructor(){
		super(Bill);
	}
	
	costCount(hostId, $matchObject) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
		var condition = [
      { 
        $match: $matchObject
      }, {
        $group: {
          '_id': {
            'year': { $year: { $add: ['$costDate', utils.timeOffset] } },
            'month': { $month: { $add: ['$costDate', utils.timeOffset] } },
            'day': { $dayOfMonth: { $add: ['$costDate', utils.timeOffset] } }
          }
        }
      }, {
        $group: {
          '_id': 0,
          'dateCount': { $sum: 1 }
        }
      }
    ];
		return this.aggregate(condition);
	}

	costOfDay(hostId, $matchObject, pageNum, page) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
		page = page || config.page;
		pageNum = pageNum || 0;
		var pages = pageNum * page;
		var condition = [
			{
				$match: $matchObject
			},
			{
				$project: {
					'costDate': {
						'year': { $year: { $add: ['$costDate', utils.timeOffset] } },
						'month': { $month: { $add: ['$costDate', utils.timeOffset] } },
						'day': { $dayOfMonth: { $add: ['$costDate', utils.timeOffset] } }
					},
					'price': 1,
					'desc': {
						'id': '$_id',
						'tag': '$tag',
						'name': '$name',
						'price': '$price',
						'detail': '$detail'
					}
				}
			},
			{
				$group: {
					'_id': {
						//拼接日期
						$concat: [
							{ $substr: ['$costDate.year', 0, 4] },
							//判断是否小于10，需要在个位数前面加0
							{ $cond: { if: { $gte: ['$costDate.month', 10] },
							           then: '-',
							           else: '-0' } },
							{ $substr: ['$costDate.month', 0, 2] },
							{ $cond: [ { $gte: ['$costDate.day', 10] }, '-', '-0' ] },
							{ $substr: ['$costDate.day', 0, 2] }
						]
					},
					'summary': { $sum: '$price' },
					'desc': { $addToSet: '$desc' }
				}
			},
			{
				//最终格式化输出格式
				$project: {
					'_id': 0,
					'date': '$_id',
					'summary': '$summary',
					'desc': '$desc'
				}
			},
			{
				//降序
				$sort: {
					'date': -1
				}
			},
			{
				$skip: pages
			},
			{
				$limit: page
			}
		];
		return this.aggregate(condition);
	}
  
  costOfWeek(hostId, $matchObject) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
    var condition = [
      { $match: $matchObject },
      { $project: {
          'year': { $year: { $add: ['$costDate', utils.timeOffset] } },
          'week': { $week: { $add: ['$costDate', utils.timeOffset] } },
          'dayOfWeek': { $dayOfWeek: { $add: ['$costDate', utils.timeOffset] } },
          'month': { $month: { $add: ['$costDate', utils.timeOffset] } },
				  'day': { $dayOfMonth: { $add: ['$costDate', utils.timeOffset] } },
          'price': 1
        } 
      },
      { $group: { 
          '_id': {
            'year': '$year',
            'week': '$week',
            'dayOfWeek': '$dayOfWeek',
            'dayOfMonth': { 
              $concat: [ { $substr: ['$month', 0, 2] }, '/', { $substr: ['$day', 0, 2] } ] 
            }
          },
          'summary': { $sum: '$price' }
        } 
      }, 
      {
        $project: {
          '_id': 0,
          'day': '$_id.dayOfWeek',
          'date': '$_id.dayOfMonth',
          'summary': '$summary'
        }
      }, 
      {
        $sort: { 'day': 1 }
      }
    ];
    return this.aggregate(condition);
  }
  
  costOfYear(hostId, $matchObject) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
    var condition = [
      { $match: $matchObject },
      { $project: {
          'year': { $year: { $add: ['$costDate', utils.timeOffset] } },
          'month': { $month: { $add: ['$costDate', utils.timeOffset] } },
          'price': 1
        } 
      },
      { $group: { 
          '_id': {
            'year': '$year',
            'month': '$month',
            'monthOfYear': { 
              $concat: [ 
                { $substr: ['$year', 0, 4] }, 
                { $cond: [ { $gte: ['$month', 10] }, '-', '-0' ] }, 
                { $substr: ['$month', 0, 2] } ] 
            }
          },
          'summary': { $sum: '$price' }
        } 
      }, 
      {
        $project: {
          '_id': 0,
          'month': '$_id.month',
          'date': '$_id.monthOfYear',
          'summary': '$summary'
        }
      }, 
      {
        $sort: { 'month': 1 }
      }
    ];
    return this.aggregate(condition);
  }
  
  costOfTag(hostId, $matchObject) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
    var condition = [
      { $match: $matchObject },
      { 
        $group: {
					'_id': { tag: '$tag' },
					'costSum': { $sum: '$price' },
					'costAvg': { $avg: '$price' }
				}
      }, 
      {
        $project: {
          '_id': 0,
          'tag': '$_id.tag',
          'summary': '$costSum',
          'avg': '$costAvg'
        }
      }, 
      {
        $sort: { 'tag': 1 }
      }
    ];
    return this.aggregate(condition);
  }

  costOfTopTag(hostId, $matchObject) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
    var condition = [
      { $match: $matchObject },
      { 
        $group: {
					'_id': { tag: '$tag', 'name': '$name' },
					'price': { $max: '$price' }
				}
      }, 
      {
        $sort: { '_id.tag': 1, 'price': -1 }
      }, 
      {
        $group: {
          '_id': { tag: '$_id.tag' },
          'name': { $first: '$_id.name' },
          'price': { $first: '$price' }
        }
      },
      {
        $project: {
          '_id': 0,
          'tag': '$_id.tag',
          'name': '$name',
          'price': '$price'
        }
      },
      {
        $sort: { 'tag': 1 }
      }
    ];
    return this.aggregate(condition);
  }

  costOfMonth(hostId, $matchObject) {
    $matchObject = $matchObject || {};
    $matchObject['host'] = mongoose.Types.ObjectId(hostId);
    var condition = [
      { $match: $matchObject },
      { $project: {
          'year': { $year: { $add: ['$costDate', utils.timeOffset] } },
          'month': { $month: { $add: ['$costDate', utils.timeOffset] } },
          'price': 1,
          'tag': 1
        } 
      },
      { $group: { 
          '_id': {
            'month': { 
              $concat: [ 
                { $substr: ['$year', 0, 4] }, 
                { $cond: [ { $gte: ['$month', 10] }, '-', '-0' ] }, 
                { $substr: ['$month', 0, 2] } ] 
            },
            'tag': '$tag'
          },
          'costSum': { $sum: '$price' },
          'costAvg': { $avg: '$price' }
        } 
      }, 
      {
        $project: {
          '_id': 0,
          'month': '$_id.month',
          'tag': '$_id.tag',
          'sumPrice': '$costSum',
          'avgPrice': '$costAvg'
        }
      }, 
      {
        $group: { 
          '_id': '$month', 
          'tag': { $addToSet: { 'tag': '$tag', 'sumPrice': '$sumPrice' } }, 
          'summary': { $sum: '$sumPrice' } 
        }
      }, 
      {
        $project: {
          '_id':0,
          'month': '$_id',
          'tag': '$tag',
          'summary': '$summary'
        }
      },
      {
        $sort: { 'month': 1 }
      }
    ];
    return this.aggregate(condition);
  }

}

module.exports = BillDao;