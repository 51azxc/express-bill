require.config({
	//配置依赖js路径
	paths: {
		'angular': '/bower_components/angular/angular',
		'angular-animate': '/bower_components/angular-animate/angular-animate',
		'angular-aria': '/bower_components/angular-aria/angular-aria',
		'angular-material': '/bower_components/angular-material/angular-material',
		'angular-router': '/bower_components/angular-ui-router/release/angular-ui-router',
		'domReady': '/bower_components/domReady/domReady',
		'myapp': '/javascripts/myapp',
		'router': '/javascripts/router',
		'controllers': '/javascripts/controllers',
	},
	//引入依赖时的包名
	shim: {
		'angular': {
			exports: 'angular'
		},
		'angular-animate': {
			deps: ['angular'],
			exports: 'angular-animate'
		},
		'angular-aria': {
			deps: ['angular'],
			exports: 'angular-aria'
		},
		'angular-material': {
			deps: ['angular', 'angular-animate', 'angular-aria'],
			exports: 'angular-material'
		},
		'angular-router': {
			deps: ['angular'],
			exports: 'angular-router'
		}
	},
	//优先加载bootstrap文件
	deps: ['bootstrap'],
	//防止读取缓存
	urlArgs: 'bust=' + (new Date()).getTime()
});