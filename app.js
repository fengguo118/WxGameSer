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
var fs           = require('fs');
var path         = require('path');
var config       = require('./config/config.js').config;
var exec         = require('child_process').exec;

exec("forever start wx.js", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

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

var uuidfun = function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
 
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;
 
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
 
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
 
    return uuid.join('');
}

var readWirteFile = function(filename, prizetype){
    var filePath = path.join(__dirname, filename);  
	var obj = fs.readFileSync(filePath, "utf-8");
	var jsonObj = JSON.parse(obj);
	if (jsonObj){
	    if (prizetype == 1 && parseInt(jsonObj.one) > 0){
		     var tmp1 = parseInt(jsonObj.one) - 1;
			 jsonObj.one = tmp1;
			 fs.writeFileSync(filePath, JSON.stringify(jsonObj));
			 return prizetype;
		}
		else if (prizetype == 2 && parseInt(jsonObj.two) > 0){
		    var tmp2 = parseInt(jsonObj.two) - 1;
			jsonObj.two = tmp2;
			fs.writeFileSync(filePath, JSON.stringify(jsonObj));
			return prizetype;
		}
		else if (prizetype == 3 && parseInt(jsonObj.three) > 0){
		    var tmp3 = parseInt(jsonObj.three) - 1;
			jsonObj.three = tmp3;
			fs.writeFileSync(filePath, JSON.stringify(jsonObj));
			return prizetype;
		}
		else if (prizetype == 4 && parseInt(jsonObj.four) > 0){
		    var tmp3 = parseInt(jsonObj.three) - 1;
			jsonObj.three = tmp3;
			fs.writeFileSync(filePath, JSON.stringify(jsonObj));
			return prizetype;
		}
		else if (prizetype == 5 && parseInt(jsonObj.three) > 0){
		    var tmp3 = parseInt(jsonObj.three) - 1;
			jsonObj.three = tmp3;
			fs.writeFileSync(filePath, JSON.stringify(jsonObj));
			return prizetype;
		}
		else if (prizetype == 6 && parseInt(jsonObj.three) > 0){
		    var tmp3 = parseInt(jsonObj.three) - 1;
			jsonObj.three = tmp3;
			fs.writeFileSync(filePath, JSON.stringify(jsonObj));
			return prizetype;
		}
		else
		{
			if (prizetype > 0 && prizetype < 4)
			{
				return Math.floor(Math.random()*5 + 1);
			}
		}
	}
	return prizetype;
}


var prizeleveProcess=function(prizetmp){
	var persionSel = "select * from wx_user";
	mysqlConnection.query(persionSel, function(error, result){
		if (error){
			console.log(error);
			return error;
		}
		if (result.length <= 0){
			return 0;
		}	
		var prizeSelect = "select prizeleve, prizeprobability, prizeprobability from prize_table";
		mysqlConnection.query(prizeSelect, function(error, result){
			if (error){
				console.log(error);
				return error;
			}	
			if (result.length > 0){
				
			}
		});
	})
}


var jangpinfun = function(){
	var prizetype = Math.floor(Math.random()*5 +1);
	return readWirteFile("jiangp.json", prizetype);
}

app.get('/zhanp/jxiang', function(req, res){
	// console.log(req);
	var jquireyObj = url.parse(req.url, true).query;
	console.log("+++++++++++++++++++", jquireyObj);
	var obj = {};
	obj.openid = jquireyObj.token;
	obj.nickname = jquireyObj.ac;
	obj.sncode   =  uuidfun(8, 16);
	obj.jnumber   = jangpinfun();
	console.log("=++++++++========", obj);
	var sqlStr = "select * from wx_user where openid=?";
	mysqlConnection.query(sqlStr, [obj.openid], function(error, result){
		if (error){
			console.log(error);
			return;
		}
		if (result.length > 0){
			var resu = result[0];
			console.log(resu);
			return res.status(200).send({"message":"success", "sn":resu.sncode, "prizetype":resu.jnumber, "error":"getsn"});
		}
		
	    var insterUsr = "INSERT INTO wx_user set ?";
	    mysqlConnection.query(insterUsr, obj, function(error, result){
		    if (error){
			     console.log(error);
			     return res.status(505).send("inster mysql is error!");
		    }
			return res.status(200).send({"message":"success", "sn":obj.sncode, "prizetype":obj.jnumber, "success":"success"});
	    })
	})
});

app.post('/zhanp/tjiao', function(req, res){
	console.log("==========-----------------------", req.body);
	var sqlStr = "select * from wx_user where sncode=?";
	mysqlConnection.query(sqlStr, [req.body.code], function(error, result){
		if (error){
			console.log(error);
			return;
		}
		if (result.length > 0){
			var resu = result[0];
			console.log("00000000", resu);
			 var insterUsr = "update wx_user set phonenum=?, passwd=? where sncode=?";
	 	    mysqlConnection.query(insterUsr, [req.body.tel, req.body.passwd, req.body.code], function(error, result){
	 		    if (error){
	 			     console.log(error);
	 			     return res.status(505).send("inster mysql is error!");
	 		    }
				console.log(result);
			});	 
		}
	});
	return res.status(200).send({success:true});
});

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