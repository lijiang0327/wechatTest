'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var WPay = require('weixin-pay');
var templates = require('templates.js');
var request = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var sha1 = require('sha1');

var app = express();
var router = express.Router();
var apiRouter = express.Router();
var server = http.createServer(app);

var appid = 'wxd150e5f673fed7ae',
    secret = 'bfb07a92e1962d09f3fd1dd26cec458b',
    token = 'imeibao';

var db = {};

function authwechat(timestamp, nonce, sign) {
    var arr = [token, timestamp, nonce], arrStr;
    arr = arr.sort();
    arrStr = arr.join('');
    arrStr = sha1(arrStr);
    if (sign === arrStr) {
        return true;
    }
    return false;
}

app.engine('tpl', templates.__express);
app.set('view engine', 'tpl');
// console.log(path.join(__dirname, 'templates'));
app.set('views', path.join(__dirname, 'templates'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(router);
app.use('/api', apiRouter);

router.get('/', (req, res, next) => {
    var list = [{name: '地三鲜'}, {name: '糖醋鱼块'}];
    res.render('index', {list: list, listname: list[0].name});
});

router.get('/index', (req, res, next) => {
    var list = [{name: '地三鲜'}, {name: '糖醋鱼块'}];

    // app.render('index', {list: list, listname: list[0].name}, (err, html) =>{
    // })
    res.render('index', {list: list, listname: list[0].name});
});

apiRouter.get('/index', (req, res, next) => {
    var list = [{name: '地三鲜'}, {name: '糖醋鱼块'}];

    res.json({list});
});


router.get('/wechat/login', (req, res, next) => {

    async.waterfall([
        function(next) {
            request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret, function(err, response, body) {
                next(err, body);
            });
        }, 
        function(token, next) {
            token = JSON.parse(token);
            request.post({
                json: true,
                url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=' + token['access_token'],
                body:  { 
                    "expire_seconds": "604800", 
                    "action_name": "QR_SCENE", 
                    "action_info": {
                        "scene": {
                            "scene_id": 123
                        }
                    }
                }
            }, function(err, response, body) {
                res.render('wxlogin', {"qrcodeurl": 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + body.ticket});
            })
        }
    ]) 
    
});

router.get('/wechat/login/watch', (req, res, next) => {
    if (db['oSm_dwKm7dRSq0WWzdldE6SFo3Fo']) {
        res.json({return_code: 'SUCCESS'});
        return;
    }
    res.json({return_code: 'ERROR'});
});

router.use('/wechat/test', (req, res, next) => {
    var query = req.query,
        timestamp = query.timestamp,
        nonce = query.nonce,
        sign = query.signature,
        echostr = query.echostr || '',
        openid = query.openid || '';
    
    console.log(query);
    // if (!authwechat(timestamp, nonce, sign)) {
    //     return;
    // }
    if (openid) {
        db.openid = true;
        res.end('true');
    }
});

server.listen(8888, '127.0.0.1', () => {
    console.log('server is running at port 8888...');
});