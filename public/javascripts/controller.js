'use strict';

myApp.controller('AppCtrl', ['$scope', '$mdSidenav', '$location', '$route', 'AuthService', 'UserService',
function($scope, $mdSidenav, $location, $route, AuthService, UserService){
  $scope.$on('checkUser', function(event, check){
  	$scope.isSignIn = AuthService.isAuthenticated();
  	if ($scope.isSignIn) {
	  UserService.getUser()
	    .then(function(response){
	      UserService.saveSessionUser(response.data.user);
          $scope.userNickname = response.data.user.nickname || '';
		  $scope.userAvatar = response.data.user.avatar || '';
	    })
	    .catch(function(response){
	      console.log(response.data.message);
	    });
    }
  });
  $scope.$on('$locationChangeStart', function(event, next, current){
  	$scope.isSignIn = AuthService.isAuthenticated();
  	var user = UserService.getSessionUser();
  	if (user) {
        $scope.userNickname = user.nickname;
		$scope.userAvatar = user.avatar+'?'+new Date().getTime();
  	}
  });
  $scope.$on('showLoading', function(e,d){
  	$scope.loading = d;
  });

  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  $scope.billList = function(){
  	$location.path('/daylist');
  };
  $scope.billChart = function(){
  	$location.path('/daychart');
  };
  $scope.showMe = function(){
  	$location.path('/userInfo');
  };
  $scope.signOut = function(){
  	AuthService.removeToken();
  	UserService.removeSessionUser();
    $location.path('/signIn');
  };
}]);

myApp.controller('SignUpCtrl', ['$scope', '$location', '$timeout', 'AlertService', 'UserService',
function($scope, $location, $timeout, AlertService, UserService){
  $scope.signUp = function(){
  	if ($scope.signUpForm.$valid) {
  		$scope.showLoading = true;
  	    $scope.error = false;
	  	$scope.disabled = true;

		  UserService.signUp($scope.user.email, $scope.user.password)
		  .then(function(response){
		  	AlertService.alertToast(response.data.message, 1000);
		  	$scope.showLoading = false;
		  	$timeout(function(){
		  	  $location.path('/signIn');
		  	}, 1000);
		  })
		  .catch(function(response){
		  	AlertService.confirmToast(response.data.message);
		  	$timeout(function(){
		  	  $scope.disabled = false;
		  	  $scope.showLoading = false;
		  	}, 3000);
		  });
  	}
  };
}]);

myApp.controller('SignInCtrl', ['$scope', '$location', '$timeout', 'UserService',
function($scope, $location, $timeout, UserService){
  $scope.signIn = function(){
  	if ($scope.signInForm.$valid) {
  	  $scope.showLoading = true;
  	  $scope.error = false;
		  $scope.disabled = true;

		  UserService.signIn($scope.user.email, $scope.user.password)
		  .then(function(response){
		  	$scope.showLoading = false;
		  	$timeout(function(){
		  	  $scope.$emit('checkUser', true);
		  	  $location.path('/daylist');
		  	}, 1000);
		  })
		  .catch(function(response){
		  	$scope.error = true;
		  	if (response.data.message) {
		  		$scope.errorMessage = response.data.message;
		  	} else {
		  		$scope.errorMessage = 'Unknown Error';
		  	}
		  	$scope.disabled = false;
		  	$scope.showLoading = false;
		  });
  	}
  };
}]);

myApp.controller('UserEditCtrl', ['$scope', 'UserService', 'Upload', '$timeout', 'AlertService',
function($scope, UserService, Upload, $timeout, AlertService){
  UserService.getUser()
	.then(function(response){
	  $scope.user = response.data.user;
	  if ($scope.user.avatar.indexOf('http') < 0) {
	  	$scope.user.avatar = '';
	  }
	})
	.catch(function(response){
	  AlertService.confirmToast(response.data.message);
	});
  $scope.editUser = function(){
  	if ($scope.userForm.$valid) {
  	  $scope.showLoading = true;
		  $scope.disabled = true;
		  if ($scope.file && $scope.isAvatarFile) {
		  	$scope.minate = 'determinate';
		  	Upload.upload({
		  	  url: '/api/users/save',
		  	  method: 'PUT',
		  	  data: {
		  	  	user: $scope.user,
		  	  	file: $scope.file
		  	  }
		  	})
		  	.progress(function(evt){
		  	  var progress = parseInt(100.0 * evt.loaded / evt.total);
		  	  $scope.minateValue = progress;
		  	})
		  	.success(function(data, status, headers, config){
		  	  $timeout(function(){
		  	    $scope.disabled = false;
		  	    $scope.showLoading = false;
		  	    $scope.$emit('checkUser', true);
		  	    AlertService.alertToast(data.message, 3000);
		  	  }, 1000);
		  	});
		  }else{
		  	$scope.minate = 'indeterminate';
		  	UserService.saveUser($scope.user)
		  	.then(function(response){
		  	  $timeout(function(){
		  	    $scope.disabled = false;
		  	    $scope.showLoading = false;
		  	    $scope.$emit('checkUser', true);
		  	    AlertService.alertToast(response.data.message, 3000);
		  	  }, 1000);
		  	})
		  	.catch(function(response){
		  	  $timeout(function(){
		  	    $scope.disabled = false;
		  	    $scope.showLoading = false;
		  	    AlertService.confirmToast(response.data.message);
		  	  }, 1000);
		  	});
		  }
  	}
  }
}]);

myApp.controller('DayListCtrl', ['$scope', '$location', 'BillService', 'AlertService',
function($scope, $location, BillService, AlertService){
	var formatDate = function(date) {
		if (date instanceof Date && !isNaN(date.valueOf())) {
			var y = date.getFullYear().toString();
			var m = (date.getMonth()+1).toString();
			var d = date.getDate().toString();
			return y + '-' + (m[1]?m:"0"+m) + '-' + (d[1]?d:"0"+d);
		}
		return '';
	};
	$scope.loaded = false;
	$scope.today = new Date();
	$scope.pageNum = 0;
	$scope.getDetail = function() {
  		BillService.dayList($location.search()).then(function(response){
  			$scope.loaded = true;
  			if (response.data.success) {
  				$scope.costDetail = response.data.pagination.data;
  				$scope.hasPrev = response.data.pagination.hasPrev;
  				$scope.hasNext = response.data.pagination.hasNext;
  				$scope.pageSize = response.data.pagination.pageSize;
  			} else {
  				AlertService.confirmToast(response.data.message);
  			}
  		}).catch(function(response){
  			$scope.loaded = true;
  			AlertService.confirmToast(response.data.message);
  		});
  	};
  	$scope.getDetail();
  	$scope.editBill = function(bid) {
  		$location.path('/editBill/'+bid);
  	};
  	$scope.search = function() {
  		var startDate = formatDate($scope.startDate), 
			endDate = formatDate($scope.endDate),
			pageNum = $scope.pageNum < 0 ? 0:$scope.pageNum;
		$location.search({'pageNum': pageNum, 'startDate': startDate, 'endDate': endDate});
		$scope.getDetail();
  	};
  	$scope.prev = function() {
  		if ($scope.pageNum > 0) {
  			$scope.pageNum -- ;
  		}else {
  			$scope.pageNum = 0;
  		}
  		$scope.search();
  	};
  	$scope.next = function() {
  		$scope.pageNum ++ ;
  		$scope.search();
  	};
  	$scope.reset = function() {
  		$scope.startDate = '';
  		$scope.endDate = '';
  		$scope.pageNum = 0;
  		$scope.search();
  	};
  	$scope.exportData = function() {
  		BillService.exportData($location.search()).then(function(response){
  			if (response.data.success) {
  				var csvContent = "data:text/csv;charset=utf-8,";
  				response.data.result.forEach(function(element, index){
  					var dataStr = element.join(',');
  					csvContent += index < response.data.result.length ? dataStr+ "\r\n" : dataStr;
  				});
  				var downloadLink = document.createElement('a');
  				downloadLink.href = encodeURI(csvContent);
  				downloadLink.download = 'test.csv';
  				document.body.appendChild(downloadLink);
  				downloadLink.click();
  				document.body.removeChild(downloadLink);
  			}
  		}).catch(function(response){
  			$scope.loaded = true;
  			AlertService.confirmToast(response.data.message);
  		});
  	};
}]);

myApp.controller('DayChartCtrl', ['$scope', '$location', 'BillService', 'AlertService', 
function($scope, $location, BillService,AlertService) {
  
  BillService.lineChart($location.search()).then(function(response){
    $scope.lineLoaded = true;
    if (response.data.success) {
      $scope.lineLabels = response.data.chartData.labels;
      $scope.lineData = response.data.chartData.data;
      if($scope.lineData.length > 1 && $scope.lineData[0].length == 7) {
        $scope.lineLegend = true;
        $scope.lineSeries = ['last week', 'this week'];
      } else {
        $scope.lineLegend = false;
      }
    } else {
      $scope.lineLabels = [];
      $scope.lineSeries = [];
      $scope.lineData = [[0]];
      $scope.lineLegend = false;
    }
  }).catch(function(response){
    $scope.lineLoaded = true;
    console.log(response.data.message);
  });
  
  $scope.lineOnClick = function (points, evt) {
    console.log(points, evt);
  };
  
  BillService.barChart($location.search()).then(function(response){
    $scope.barLoaded = true;
    if (response.data.success) {
      $scope.barLabels = response.data.chartData.labels;
      $scope.barData = response.data.chartData.data;
      if($scope.barData.length > 1 && $scope.barData[0].length == 12) {
        $scope.barLegend = true;
        $scope.barSeries = ['last year', 'this year'];
      } else {
        $scope.barLegend = false;
      }
    } else {
      $scope.barLabels = ['Nothing'];
      $scope.barSeries = [];
      $scope.barData = [[0]];
      $scope.barLegend = false;
    }
  }).catch(function(response){
    $scope.barLoaded = true;
    console.log(response.data.message);
  });
  
  BillService.arcChart($location.search()).then(function(response){
    $scope.arcLoaded = true;
    if (response.data.success) {
      $scope.doughnutLabels = response.data.chartData.labels;
      $scope.doughnutData = response.data.chartData.data;
      $scope.doughnutLegend = true;
    } else {
      $scope.doughnutLabels = [];
      $scope.doughnutData = [0];
      $scope.doughnutLegend = false;
    }
  }).catch(function(response){
    $scope.barLoaded = true;
    console.log(response.data.message);
  });

  BillService.pieChart($location.search()).then(function(response){
    $scope.arcLoaded = true;
    if (response.data.success) {
      $scope.dynamicLabels = response.data.chartData.labels;
      $scope.dynamicData = response.data.chartData.data;
      $scope.dynamicLegend = true;
    } else {
      $scope.dynamicLabels = [];
      $scope.dynamicData = [0];
      $scope.dynamicLegend = false;
    }
  }).catch(function(response){
    $scope.barLoaded = true;
    console.log(response.data.message);
  });

  $scope.dynamicType = 'PolarArea';

  $scope.toggle = function () {
    $scope.dynamicType = $scope.dynamicType === 'PolarArea' ? 'Pie' : 'PolarArea';
  };
  
}]);

myApp.controller('BillCreateCtrl', ['$scope', 'BillService', '$location', 'AlertService', 'Upload',
function($scope, BillService, $location, AlertService, Upload){
	$scope.bill = {};
  $scope.bill.costDate = new Date();
  $scope.minDate = new Date(
  	$scope.bill.costDate.getFullYear(),
    $scope.bill.costDate.getMonth() - 3,
    $scope.bill.costDate.getDate()
  );
	$scope.maxDate = new Date(
		$scope.bill.costDate.getFullYear(),
    $scope.bill.costDate.getMonth() + 3,
    $scope.bill.costDate.getDate()
  );
  $scope.addBill = function(){
    //$scope.bill.costDate.setTime(new Date().getTime());
    var bill = $scope.bill;
    bill.costDate = bill.costDate.toString();
  	if ($scope.billForm.$valid) {
  	  $scope.loading = true;
		  $scope.disabled = true;

		  if ($scope.files) {
		  	Upload.upload({
		  		url: '/api/bills/add',
		  	  method: 'POST',
		  	  arrayKey: '', // default is '[i]', but multer doesn't supported the array syntax
		  	  data: {
		  	  	bill: bill,
		  	  	files: $scope.files
		  	  }
		  	}).then(function(response){
		  	  $scope.loading = false;
		  	  $scope.disabled = false;
		  	  AlertService.alertDialog('#billFormDiv', false, 'Create a bill', response.data.message)
		  	  .then(function(answer){
		  		  $location.path('/daylist');
		  	  });
		  	}, function(response){
					$scope.loading = false;
		  	  $scope.disabled = false;
		  		AlertService.alertDialog('#billFormDiv', false, 'Create a bill', response.data.message);
		  	});
		  } else {
		  	BillService.addBill(bill)
			  .then(function(response){
			  	$scope.loading = false;
		  	  $scope.disabled = false;
			  	AlertService.alertDialog('#billFormDiv', false, 'Create a bill', response.data.message)
			  	.then(function(answer){
			  		$location.path('/daylist');
			  	});
			  })
			  .catch(function(response){
			  	$scope.loading = false;
		  	  $scope.disabled = false;
			  	AlertService.alertDialog('#billFormDiv', false, 'Create a bill', response.data.message);
			  });
		  }
  	}
  };
}]);

myApp.controller('BillEditCtrl', 
['$scope', '$location', '$routeParams', '$mdDialog', 'BillService', 'AlertService', 'Upload',
function($scope, $location, $routeParams, $mdDialog, BillService, AlertService, Upload){
	console.log($location.search());
	var bid = $routeParams.bid;
	BillService.oneBill(bid)
	.then(function(response){
		var urls = response.data.data.images;
		if (urls) {
			var images = [];
			for(var url of urls){
				var image = {};
				image.url = url;
				image.selected = true;
				images.push(image);
			}
			$scope.images = images;
		}
		$scope.bill = response.data.data;
		var currentDate = new Date($scope.bill.costDate);
		$scope.bill.costDate = currentDate;
		$scope.minDate = new Date(
	  	currentDate.getFullYear(),
	    currentDate.getMonth() - 3,
	    currentDate.getDate()
	  );
		$scope.maxDate = new Date(
			currentDate.getFullYear(),
	    currentDate.getMonth() + 3,
	    currentDate.getDate()
	  );
	})
	.catch(function(response){
		AlertService.confirmToast(response.data.message);
	});
	$scope.editBill = function(){
  	if ($scope.billForm.$valid) {
  	  $scope.loading = true;
		  $scope.disabled = true;
		  var delImagesArray = [];
		  var saveImagesArray = [];
		  for(var image of $scope.images){
		  	if (image.selected) {
		  		saveImagesArray.push(image.url);
		  	}else{
		  		delImagesArray.push(image.url);
		  	}
		  }
		  var delImages = '', saveImages = '';
		  if (delImagesArray.length > 0) {
		  	delImages = delImagesArray.join(',');
		  }
		  if (saveImagesArray.length > 0) {
		  	saveImages = saveImagesArray.join(',');
		  }
		  if ($scope.files) {
		  	Upload.upload({
		  		url: '/api/bills/modify/'+bid,
		  	  method: 'PUT',
		  	  arrayKey: '', // default is '[i]', but multer doesn't supported the array syntax
		  	  data: {
		  	  	bill: $scope.bill,
		  	  	delImages: delImages,
		  	  	saveImages: saveImages,
		  	  	files: $scope.files
		  	  }
		  	}).then(function(response){
		  	  $scope.loading = false;
		  	  $scope.disabled = false;
		  	  AlertService.alertDialog('#billFormDiv', false, 'Edit a bill', response.data.message)
		  	  .then(function(answer){
		  		  $location.path('/daylist');
		  	  });
		  	}, function(response){
					$scope.loading = false;
		  	  $scope.disabled = false;
		  		AlertService.alertDialog('#billFormDiv', false, 'Edit a bill', response.data.message);
		  	});
		  } else {
		  	BillService.editBill(bid,$scope.bill,delImages,saveImages)
			  .then(function(response){
			  	$scope.showLoading = false;
			  	AlertService.alertDialog('#billFormDiv', false, 'Edit a bill', response.data.message)
			  	.then(function(answer){
			  		$location.path('/daylist');
			  	});
			  })
			  .catch(function(response){
			  	$scope.showLoading = false;
			  	AlertService.alertDialog('#billFormDiv', false, 'Edit a bill', response.data.message);
			  });
		  }
  	}
  };
  $scope.deleteBill = function(){
  	AlertService.confirmDialog('#billFormDiv', true, 'Delete a bill', 'Are you sure?')
		.then(function(){
		  $scope.loading = true;
		  $scope.disabled = true;
		  BillService.deleteBill(bid)
		  .then(function(response){
		  	$scope.showLoading = false;
		  	AlertService.alertDialog('#billFormDiv', false, 'Edit a bill', response.data.message)
		  	.then(function(answer){
		  		$location.path('/daylist');
		  	});
		  })
		  .catch(function(response){
		  	$scope.showLoading = false;
		  	AlertService.alertDialog('#billFormDiv', false, 'Create a bill', response.data.message);
		  });
		}, function(){
		  //cancel
		});
  };
  $scope.manifyPlus = function(url, ev){
  	$mdDialog.show({
  		templateUrl: 'showImg.html',
  		//parent: angular.element(document.querySelector('#billFormDiv')),
  		locals: { imgUrl: url },
  		controller: function($scope, $mdDialog, imgUrl){
  			$scope.imgUrl = imgUrl;
  			$scope.cancel = function(){
  				$mdDialog.cancel();
  			};
  		},
  		clickOutsideToClose:true,
  		targetEvent: ev
  	});
  };
}]);
