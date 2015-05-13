/*
* node js版本的微信第三方游戏管理平台
*/

/* 引入第三方中间件*/
var crypto      = require('crypto');
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
/**
 *  * 检查签名
 *   */
var checkSignature = function (query, token) {
  var signature = query.signature;
  var timestamp = query.timestamp;
  var nonce = query.nonce;

  var shasum = crypto.createHash('sha1');
  var arr = [token, timestamp, nonce].sort();
    shasum.update(arr.join(''));

  return shasum.digest('hex') === signature;
};

// app.use(function(req, res){
// 	var query = req.query;
// 	if (checkSignature(query, "junginfomation")){
// 	     return res.send(query.echostr);
// 		 next();
// 	}
//
// 	return res.send("Bad token!");
// });

app.use(express.query());
app.use(wechat(config.wechat, wechat.text(function(message, req, res, next){
	if (message && (message.content === "抽奖" || message.content === "大转盘")){
		res.reply({
			type:"news",
			content:[{
				title:'100%有奖 千万好礼免费领',
				description:'HTL家居O2O商城荣耀开启，幸运大抽奖，千万别手软哦！',
				picurl:'http://game.htlhome.com:8090/zhanp/image/activity-lottery-1.png',
				url:'http://game.htlhome.com:8090/zhanp'
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
	if (message.Event === 'subscribe') {
		res.reply({
			type:'news',
			content:[{
				title:'100%有奖 千万好礼免费领',
				description:'HTL家居O2O商城荣耀开启，幸运大抽奖，千万别手软哦！',
				picurl:'http://game.htlhome.com:8090/zhanp/image/activity-lottery-1.png',
				url:'http://game.htlhome.com:8090/zhanp'
			}]
		});
	} else if (message.Event === 'CLICK') {
		if (message.EventKey === 'V1001_TODAY_MUSIC') {
			res.reply({
				type: 'text',
				content: 'thanks for you welcome!'
			});
		}
	}
})
.middlewarify()
));

var wxmenuapi = new wechatapi(config.wechatapi.appid, config.wechatapi.secret);


var menuJson;

var selectFunction = function(){
	var selStr = "SELECT mType as type, mName as name, mUrlOrKey as keyOrUrl  FROM menu_table WHERE isSubBtn = 'NO'";
	mysqlConnection.query(selStr, function(error, result){
		menuJson = formatData(result);
		return menuJson;
	});
}

var isEmptyObjec = function(data){
	for (var n in data){
		return false;
	}
	return true;
}

var fatherNameSelFun = function(){
	var selSubStr = "SELECT mFatherName FROM menu_table WHERE isSubBtn = 'YES'";
	mysqlConnection.query(selSubStr, function(err, resultSub){
		var tmpObj = "";
		resultSub.forEach(function(t){
			if (tmpObj === t.mFatherName)
			{
				delete t.mFatherName
			}
			tmpObj = t.mFatherName;
		})
		resultSub.forEach(function(t){
			if (!isEmptyObjec(t)){
				selectSubFunction(t.mFatherName);
			}
		})
	});
}

var selectSubFunction = function(data){
	var selSubStr = "SELECT mType as type, mName as name, mUrlOrKey as keyOrUrl FROM menu_table WHERE mFatherName =?";
	mysqlConnection.query(selSubStr, [data], function(err, resultSub){
		var fatherMenu=formatData(resultSub);
		menuJson.push(createTwoMenu(data, fatherMenu));
		console.log("**********************************", menuJson);
		menuCallBack();
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
	return data;
}


var createTwoMenu =function(t, data){
	var da = {
		"name":t,
		"sub_button":data
	};
	return da;
}

var menuCretaeFun = function(){
	selectFunction();
	fatherNameSelFun();
}

 menuCretaeFun();

var menuCallBack = function(){
	wxmenuapi.createMenu(menuJson, function(err, result){
		if (err){
			console.log(err);
		}
		else{
			console.log(result);
		}
	});
}


/*监听端口*/
app.listen(80);

console.log("wechat service is starting...");