'use strict';

var fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  multer = require('multer'),
  jwt = require('jsonwebtoken');

var fsStatPromise = Q.denodeify(fs.stat),
  fsUnlinkPromise = Q.denodeify(fs.unlink);

var uploadPath = () => {
  var uploadPath = path.join(__dirname, '../uploads');
  try {
    fs.accessSync(uploadPath, fs.F_OK);
    return uploadPath;
  } catch (e) {
    try {
      fs.mkdirSync(uploadPath);
      return uploadPath;
    } catch (e) {
      console.err(e);
      return '';
    }
  }
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    var fname = '';
    if (req.decoded) {
      fname = req.decoded;
    }
    fname = fname + '_' + Date.now() + path.extname(file.originalname);
    cb(null, fname);
  }
});

var upload = multer({
  storage: storage
});

var removeFile = (fileName) => {
  var filePath = path.join(__dirname, '..', fileName);
  fsStatPromise(filePath).then((stat) => {
    if (stat.isFile()) {
      fsUnlinkPromise(filePath).then(null, console.err);
    }
  }, console.err);
};

var timeOffset = () => {
  //The getTimezoneOffset() method returns the time difference between UTC time and local time, in minutes.
  var offset = new Date().getTimezoneOffset();
  offset = -offset * 60 * 1000;
  return offset;
};

var dateRange = (startDate, endDate) => {
  var $matchObject = {};
  if (startDate && endDate) {
    var $startDate = new Date(startDate);
    $startDate.setHours(0, 0, 0, 0);
    var $endDate = new Date(endDate);
    $endDate.setHours(23, 59, 59, 999);
    $matchObject['costDate'] = { $gte: $startDate, $lt: $endDate };
  } else if (startDate) {
    var $startDate = new Date(startDate);
    $startDate.setHours(0, 0, 0, 0);
    $matchObject['costDate'] = { $gte: $startDate };
  } else if (endDate) {
    var $endDate = new Date(endDate);
    $endDate.setHours(23, 59, 59, 999);
    $matchObject['costDate'] = { $lt: $endDate };
  }
  return $matchObject;
};

var formatWeekDay = (day) => {
  var formatLabel = '';
  switch(day){
    case 1: 
      formatLabel = 'Sun'; 
      break;
    case 2: 
      formatLabel = 'Mon'; 
      break;
    case 3: 
      formatLabel = 'Tue'; 
      break;
    case 4: 
      formatLabel = 'Wed'; 
      break;
    case 5: 
      formatLabel = 'Thu'; 
      break;
    case 6: 
      formatLabel = 'Fri'; 
      break;
    case 7: 
      formatLabel = 'Sat'; 
      break;
  }
  return formatLabel;
};

var formatMonth = (month) => {
  var formatLabel = '';
  switch(month){
    case 1: 
      formatLabel = 'Jan'; 
      break;
    case 2: 
      formatLabel = 'Feb'; 
      break;
    case 3: 
      formatLabel = 'Mar'; 
      break;
    case 4: 
      formatLabel = 'Apr'; 
      break;
    case 5: 
      formatLabel = 'May'; 
      break;
    case 6: 
      formatLabel = 'Jul'; 
      break;
    case 7: 
      formatLabel = 'Jun'; 
      break;
    case 8: 
      formatLabel = 'Aug'; 
      break;
    case 9: 
      formatLabel = 'Sep'; 
      break;
    case 10: 
      formatLabel = 'Oct'; 
      break;
    case 11: 
      formatLabel = 'Nov'; 
      break;
    case 12: 
      formatLabel = 'Dec'; 
      break;
  }
  return formatLabel;
};

var formatTag = (tag) => {
  var formatLabel = '';
  switch(parseInt(tag)){
    case 1: 
      formatLabel = '衣'; 
      break;
    case 2: 
      formatLabel = '食'; 
      break;
    case 3: 
      formatLabel = '住'; 
      break;
    case 4: 
      formatLabel = '行'; 
      break;
    case 5: 
      formatLabel = '杂'; 
      break;
  }
  return formatLabel;
}

var fillWeekData = (dataList) => {
  var labels = Array.from({length: 7}, (v, k) => k+1).map(formatWeekDay), chartData = [], subChartData = [];
  dataList.forEach( (data) => {
    subChartData = [];
    for (var i = 1, len = labels.length; i <= len; i++) {
      var tmpData = data.filter( (x) => (x.day == i))[0] || { summary: 0, day: i };
      subChartData.push(tmpData.summary.toFixed(2));
    }
    chartData.push(subChartData);
  } );
  return { labels: labels, chartData: chartData };
};

var fillMonthData = (dataList) => {
  var labels = Array.from({length: 12}, (v, k) => k+1).map(formatMonth), chartData = [], subChartData = [];
  dataList.forEach( (data) => {
    subChartData = [];
    for (var i = 1, len = labels.length; i <= len; i++) {
      var tmpData = data.filter( (x) => (x.month == i))[0] || { summary: 0, month: i };
      subChartData.push(tmpData.summary.toFixed(2));
    }
    chartData.push(subChartData);
  } );
  return { labels: labels, chartData: chartData };
};

var fillTagData = (dataList) => {
  var results = [];
  results.push(['month','clothing','food','room','traffic','other','total']);
  dataList.forEach( (data) => {
    var subData = [];
    subData.push(data.month);
    for (var i = 1; i <= 5; i++) {
      var tmpData = data.tag.filter( (x) => (x.tag == i) )[0] || { tag: i, sumPrice: 0 };
      subData.push(tmpData.sumPrice.toFixed(2));
    }
    subData.push(data.summary.toFixed(2));
    results.push(subData);
  } );
  return results;
};

module.exports = {
  'uploadPath': uploadPath(),
  'upload': upload,
  'removeFile': removeFile,
  'timeOffset': timeOffset(),
  'dateRange': dateRange,
  'fillWeekData': fillWeekData,
  'fillMonthData': fillMonthData,
  'formatTag': formatTag,
  'fillTagData': fillTagData
};