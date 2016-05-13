
"use strict";

const https = require('https');
const mongoose = require('mongoose');

const DB = 'mongodb://shang:shang123@127.0.0.1:27017/domain';

const word = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','w'];

const mainSchema = new mongoose.Schema({
    name: String,
    status: Boolean,
    info: mongoose.Schema.Types.Mixed
});
const logSchema = new mongoose.Schema({
    i: Number,
    j: Number
});

var domain = mongoose.model('domain', mainSchema);
var log = mongoose.model('log', logSchema);
log.findOne({},function(err,doc){

    let i = doc.i, j = doc.j;
    setInterval(function(){

        var url = 'http://api.whoapi.com/?apikey=2bc7de0a36a1584590ac5995f5319c59&r=whois&domain='+ word[i] + word[j] + '.com';

        var options = {
            hostname: 'api.whoapi.com',
            path: url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };

        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var data = JSON.parse(chunk);
                if(data.status == 0){
                    var sa = new domain({
                        name: word[i] + word[j] + '.com',
                        status:data.registered,
                        info: data
                    });
                    sa.save();
                    log.findOne({},function(err,mei){
                        mei.i = i;
                        mei.j = j;
                        mei.save();
                    })
                }else{
                    console.log(data);
                }

            });
            res.on('error',function(err){
                console.log(err);
            });
        });
        req.end();

        if(j<25){
            j++;
        }else{
            i++;
            j = 0;
        }

    },1100*60);

});



mongoose.connect(DB);