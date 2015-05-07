/*
* node js版本的微信第三方游戏管理平台
*/

/* 引入第三方中间件*/

var express      = require('express');
var app          = express();
var bodyparser   = require('body-parser');
var cookieparser = require('cookie-parser');
var session      = require('express-session');
var url          = require('url');
var mysql        = require('mysql');
var config       = require('./config/config.js').config;

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(cookieparser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
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

/*平台自定义接口*/

app.post('/login', function(req, res){
	if (req.session.username){
		var reslt = req.session;
		return res.status(200).send(reslt);
	}
	if (!req.body.username || !req.body.password){
		return res.status(408).send({message:'arguments error'});
	}	
	var selStr = "SELECT password FROM user_table where username = ?";
	mysqlConnection.query(selStr, [req.body.username], function(err, result){
		if (err){
			return res.status(500).send({message:err});
		}
		if (result.length < 1){
			return res.status(405).send({message:'invalid user'});
		}
		if (result[0].password === req.body.password){
			var retreuslt = {
				message:'login success',
				username:req.body.username,
				password:result[0].password
			}
			req.session.save(function(err){
				req.session = retreuslt;
			}); 
			return res.status(200).send(retreuslt);
		}else{
			return res.status(405).send({message:'password error'});
		}
	})
});


/*监听端口*/
app.listen(8090);

console.log("service is starting...");