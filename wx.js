/*
 * node js版本的微信第三方游戏管理平台
 */

/* 引入第三方中间件*/

var express      = require('express');
var app          = express();
var bodyparser   = require('body-parser');
var cookieparser = require('cookie-parser');
var url          = require('url');
var mysql        = require('mysql');
var wechat       = require('wechat');
var wechatapi    = require('wechat-api');
var config       = require('./config/config.js').config;


app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(express.static(__dirname + '/static'));

/*mysql数据库链接信息*/

var mysqlConnection = mysql.createConnection(config.mysql);

mysqlConnection.connect();

var connectErrorFun = function(error) {
	if (!error.fatal) {
		return;
	}

	if ((error.code !== 'PROTOCOL_CONNECTION_LOST') && (error.code !== 'ECONNREFUSED')) {
		throw error;
	}

	setTimeout(function() {
		mysqlConnection.connect();
	}, 1000);
};

mysqlConnection.on('error', function(error) {
	return connectErrorFun(error);
});

var keepConnected = function() {
	setInterval(function() {
		mysqlConnection.query("SELECT 1", function(error) {
			if (error) {
				mysqlConnection = mysql.createConnection(config.mysql);
				mysqlConnection.connect();
				mysqlConnection.on('error', function(errof) {
					return connectErrorFun(error);
				});
			}
		})
	}, 600 * 1000)
}

keepConnected();

/*微信中间件*/
app.use(express.query());
app.use(wechat(config.wechat, wechat.text(function(message, req, res, next){
	if (message && (message.content === "抽奖" || message.content === "大转盘")){
		res.reply({
			type:'news',
			content:[{
				title:'',
				description:'',
				picurl:'',
				url:''
			}]	
		});
	}
})
.image(function(message, req, res, next){
	
})
.voice(function(message, req, res, next){
	
})
.video(function(message, req, res, next){
	
})
.location(function(message, req, res, next){
	
})
.link(function(message, req, res, next){
	
})
.event(function(message, req, res, nexgt){
	
})
.middlewarify()
));

var wxmenuapi = new wechatapi(config.wechatapi.appid, config.wechatapi.secret);

var selectFunction = function(){
	var selStr = "SELECT mType as type, mName as name, mUrlOrKey as keyOrUrl  FROM menu_table WHERE isSubBtn = 'NO'";
	mysqlConnection.query(selStr, function(error, result){
		console.log(result);
		pramers = result;
		return formatData(result);
	});
}

var fatherNameSelFun = function(){
	var selSubStr = "SELECT mFatherName FROM menu_table WHERE isSubBtn = 'YES'";
	mysqlConnection.query(selSubStr, function(err, resultSub){
		var tmpObj = "";
		resultSub.forEach(function(t){
			if (tmpObj === t.mFatherName)
			{
				delete t.mFatherName
				continue;
			}
			tmpObj = t.mFatherName;
		})
		console.log(resultSub);
		return resultSub;
	});
}

var selectSubFunction = function(data){
	var selSubStr = "SELECT mType as type, mName as name, mUrlOrKey as keyOrUrl FROM menu_table WHERE mFatherName =?";
	mysqlConnection.query(selSubStr, [data], function(err, resultSub){
		return formatData(resultSub);
	});
}

var formatData = function(data){
	data.forEach(function(tmp){
		if (tmp.type === "view"){
			tmp.url = tmp.keyOrUrl;
			delete tmp.keyOrUrl;
		}
		else{
			tmp.key = tmp.keyOrUrl;
			delete tmp.keyOrUrl;
		}
	})
}


var createTwoMenu =function(t, data){
	return {
		"name":t,
		"sub_button":data
	};
}

var mysqlMenu = function(){
	var menuJson = selectFunction();
	var fatherMenu = fatherNameSelFun();
	if (fatherMenu && fatherMenu.length > 0){
		fatherMenu.forEach(function(t){
			console.log("=======================", t);
			menuJson.push(createMenu(t, selectSubFunction(t)));
		})
	}

	wxmenuapi.createMenu(menuJson, function(err, result){
		if (err){
			console.log(err);
		}
		else{
			console.log(result);
		}
	});
}

mysqlMenu();
	

/*平台自定义接口*/

/*监听端口*/
app.listen(8080);

console.log("service is starting...");