'use strict';

var express = require('express'),
  Q = require('q'),
  UserDao = require('../dao/userDao'),
  BillDao = require('../dao/billDao'),
  Bill = require('../models/bill'),
  utils = require('../utils/utils'),
  config = require('../utils/config.json');

var router = express.Router(),
  userDao = new UserDao(),
  billDao = new BillDao();

router.use((req, res, next) => {
  if (req.user && req.params.bid) {
    billDao.findOne({
        host: req.user.id
      })
      .then(function (data) {
        next();
      }, function (error) {
        res.render('index');
      });
  }
  next();
});

router.post('/add', utils.upload.array('files'), (req, res) => {
  if (req.user && req.body.bill) {
    var user = req.user.id;
    var bill = req.body.bill;
    bill.host = user;
    if (req.files) {
      bill.images = req.files.map(uploadFile => uploadFile.path.replace(/\\/g, '/'));
    }
    billDao.save(bill).then(function (data) {
      return userDao.addBill(req.user.id, data);
    }).then(function (data) {
      res.json({
        success: true,
        message: 'add bill successful'
      });
    }).catch(function (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    });
  } else {
    res.status(405).json({
      success: false,
      message: 'error parameters'
    });
  }
});

router.put('/modify/:bid', utils.upload.array('files'), (req, res) => {
  var bill = req.body.bill
  if (req.params.bid && bill) {
    if (bill._id) {
      delete bill._id;
    }
    var delImages = req.body.delImages;
    var delImagesArray = delImages.split(',');
    if (delImagesArray && delImagesArray.length > 0) {
      var imagePathArray = delImagesArray.filter(imagePath => (imagePath || '') != '');
      imagePathArray.forEach((path) => utils.removeFile(path));
    }
    var saveImages = req.body.saveImages;
    var saveImagesArray = saveImages.split(',');
    if (req.files) {
      saveImagesArray = req.files.map(uploadFile => uploadFile.path.replace(/\\/g, '/'));
    }
    bill.images = saveImagesArray;
    billDao.update({
        _id: req.params.bid
      }, bill)
      .then(function (data) {
        res.json({
          success: true,
          message: 'modify bill successful'
        });
      }, function (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      });
  } else {
    res.status(405).json({
      success: false,
      message: 'error parameters'
    });
  }
});

router.delete('/delete/:bid', (req, res) => {
  if (req.params.bid) {
    billDao.remove(req.params.bid)
      .then(function (data) {
        res.json({
          success: true,
          message: 'delete bill successful'
        });
      }, function (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      });
  }
});

router.get('/find', (req, res) => {
  var obj = req.body || {};
  obj.host = req.user.id;
  billDao.find(obj)
    .then(function (data) {
      res.json({
        success: true,
        data: data
      });
    }, function (error) {
      res.json({
        success: false,
        message: error.message
      });
    });
});

router.get('/find/:bid', (req, res) => {
  if (req.params.bid) {
    var query = {
      _id: req.params.bid
    };
    billDao.findOne(query)
      .then(function (data) {
        res.json({
          success: true,
          data: data
        });
      }, function (error) {
        res.json({
          success: false,
          message: error.message
        });
      });
  }
});

router.get('/day', (req, res) => {
  var startDate = req.query.startDate || '';
  var endDate = req.query.endDate || '';
  var pageNum = parseInt(req.query.pageNum) || 0;
  var page = config.page;
  var $matchObject = utils.dateRange(startDate, endDate);
  Q.all([
		billDao.costCount(req.user.id, $matchObject),
		billDao.costOfDay(req.user.id, $matchObject, pageNum, page)
  ]).spread((countOfCost, dayOfCost) => {
  		if (countOfCost.length != 0 && dayOfCost.length != 0) {
  			var count = countOfCost[0].dateCount;
		    var pageSize = Math.ceil(count / page);
		    var pagination = {};
		    pagination['hasPrev'] = pageNum != 0;
		    pagination['hasNext'] = pageNum < pageSize - 1;
		    pagination['count'] = count;
		    pagination['pageSize'] = pageSize;
		    pagination['data'] = dayOfCost;
		    res.json({
		      success: true,
		      pagination: pagination
		    });
  		} else {
  			var pagination = { 'hasPrev': false, 'hasNext': false, 'count': 0, 'pageSize': 0, data: [] };
  			res.json({
  				success: true,
  				pagination: pagination
  			});
  		}
  		
  }, (error) => {
	    res.json({
	      success: false,
	      message: error.message
	    });
  });
});

router.get('/lineChart', (req, res) => {
  var startDate = req.query.startDate || '';
  var endDate = req.query.endDate || '';
  var $matchObject = {};
  if (startDate || endDate) {
    $matchObject = utils.dateRange(startDate, endDate);
    billDao.costOfWeek(req.user.id, $matchObject).then( (result) => {
      var labels = [], data = [];
      result.forEach((element, index, array) => {
        labels.push(element.date);
        data.push(element.summary.toFixed(2));
      });
      res.json({
        success: true,
        chartData: { labels: labels, data: data }
      });
    }, (error) => {
      res.json({
        success: false,
        message: error.message
      });
    });
  } else {
    var d = new Date();
    var $sunday = new Date(d.setDate(d.getDate() - d.getDay()));
    var $saturday = new Date(d.setDate(d.getDate() - d.getDay() + 6));
    $matchObject = utils.dateRange($sunday, $saturday);
    var lastWeekDate = new Date(new Date().setDate(new Date().getDate() - 7));
    var $lastSunday = new Date(lastWeekDate.setDate(lastWeekDate.getDate() - lastWeekDate.getDay()));
    var $lastSaturday = new Date(lastWeekDate.setDate(lastWeekDate.getDate() - lastWeekDate.getDay() + 6));
    var $lastMatchObject = utils.dateRange($lastSunday, $lastSaturday);
    
    Q.all([
      billDao.costOfWeek(req.user.id, $lastMatchObject),
      billDao.costOfWeek(req.user.id, $matchObject)
    ]).then((result) => {
      var weekData = utils.fillWeekData(result);
      res.json({
        success: true,
        chartData: { labels: weekData.labels, data: weekData.chartData }
      });
    }, (error) => {
      res.json({
        success: false,
        message: error.message
      });
    });
  }
});

router.get('/barChart', (req, res) => {
  var startDate = req.query.startDate || '';
  var endDate = req.query.endDate || '';
  var $matchObject = {};
  if (startDate || endDate) {
    $matchObject = utils.dateRange(startDate, endDate);
    billDao.costOfYear(req.user.id, $matchObject).then( (result) => {
      var labels = [], data = [];
      result.forEach((element, index, array) => {
        labels.push(element.date);
        data.push(element.summary.toFixed(2));
      });
      res.json({
        success: true,
        chartData: { labels: labels, data: data }
      });
    }, (error) => {
      res.json({
        success: false,
        message: error.message
      });
    });
  } else {
    var d = new Date();
    var $firstDay = new Date(d.getFullYear(), 0, 1);
    var $lastDay = new Date(d.getFullYear(), 11, 31); 
    $matchObject = utils.dateRange($firstDay, $lastDay);
    var $lastYearFirstDay = new Date(d.getFullYear() - 1, 0, 1);
    var $lastYearLastDay = new Date(d.getFullYear() - 1, 11, 31);
    var $lastMatchObject = utils.dateRange($lastYearFirstDay, $lastYearLastDay);
    
    Q.all([
      billDao.costOfYear(req.user.id, $lastMatchObject),
      billDao.costOfYear(req.user.id, $matchObject)
    ]).then((result) => {
      var monthData = utils.fillMonthData(result);
      res.json({
        success: true,
        chartData: { labels: monthData.labels, data: monthData.chartData }
      });
    }, (error) => {
      res.json({
        success: false,
        message: error.message
      });
    });
  }
});

router.get('/arcChart', (req, res) => {
  var startDate = req.query.startDate || '';
  var endDate = req.query.endDate || '';
  if (!(startDate || endDate)) {
    var d = new Date();
    var startDate = new Date(d.getFullYear(), 0, 1);
    var endDate = new Date(d.getFullYear(), 11, 31);
  }
  var $matchObject = utils.dateRange(startDate, endDate);
  billDao.costOfTag(req.user.id, $matchObject).then((result) => {
    var labels = [], data = [];
    result.forEach((elem) => {
      labels.push(utils.formatTag(elem.tag));
      data.push(elem.summary.toFixed(2));
    });
    res.json({
      success: true,
      chartData: { labels: labels, data: data }
    });
  }, (error) => {
    res.json({
      success: false,
      message: error.message
    });
  });
});

router.get('/pieChart', (req, res) => {
  var startDate = req.query.startDate || '';
  var endDate = req.query.endDate || '';
  if (!(startDate || endDate)) {
    var d = new Date();
    var startDate = new Date(d.getFullYear(), 0, 1);
    var endDate = new Date(d.getFullYear(), 11, 31);
  }
  var $matchObject = utils.dateRange(startDate, endDate);
  billDao.costOfTopTag(req.user.id, $matchObject).then((result) => {
    var labels = [], data = [];
    result.forEach((elem) => {
      labels.push(elem.name);
      data.push(elem.price.toFixed(2));
    });
    res.json({
      success: true,
      chartData: { labels: labels, data: data }
    });
  }, (error) => {
    res.json({
      success: false,
      message: error.message
    });
  });
});

router.get('/excel', (req, res) => {
  var startDate = req.query.startDate || '';
  var endDate = req.query.endDate || '';
  if (!(startDate || endDate)) {
    var d = new Date();
    var startDate = new Date(d.getFullYear(), 0, 1);
    var endDate = new Date(d.getFullYear(), 11, 31);
  }
  var $matchObject = utils.dateRange(startDate, endDate);
  billDao.costOfMonth(req.user.id, $matchObject).then((result) => {
    var resultData = utils.fillTagData(result);
    res.json({
      success: true,
      result: resultData
    });
  }, (error) => {
    res.json({
      success: false,
      message: error.message
    });
  });
});

module.exports = router;