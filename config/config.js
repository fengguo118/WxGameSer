/*
 * 配置文件， mysql， wechat， wechat-api
 */

module.exports = {
	config:{
		mysql:{
			host: '121.41.112.165',
			port: '3306',
			user: 'root',
			password: '234216',
			database: 'wechat',
			timezone: 'Asia/Shanghai'
		},
		wechat:{
			token: 'junginfomation',
			appid: 'wxf33292db9a79f4f8',
			encodingAESKey: 'eiBafhfN01T2K1Gmv7bXLD8tuHAhLrPivHj0UCKTpCE'
		},
		wechatapi:{
			appid:'wxf33292db9a79f4f8',
			secret:'96c03fc0fd497512440b9edfb81c4c2b'
		}
	}
};