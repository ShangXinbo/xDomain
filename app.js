
"use strict";

const https = require('https');
const mongoose = require('mongoose');

const DB = 'mongodb://shang:shang123@127.0.0.1:27017/domain';

const mainSchema = new mongoose.Schema({
    name: String,
    status: Boolean,
    info: mongoose.Schema.Types.Mixed
});

const logSchema = new mongoose.Schema({
    serial0: Number,
    serial1: Number,
    serial2: Number,
    serial3: Number,
    serial4: Number
});

const word = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const number = [0,1,2,3,4,5,6,7,8,9];


let domainNumber = 3;

let collectionName = '';
for(var i=0;i<domainNumber;i++){
    collectionName += 'x';
}

var domain = mongoose.model(collectionName, mainSchema);
var log = mongoose.model('log', logSchema);

log.findOne({},function(err,doc){



    var mytimer = setInterval(function(){

        let domainName = '', domainType = '.com';

        for(var i=0;i<domainNumber;i++){
            domainName += word[doc['serial'+i]];
        }

        var url = 'http://api.whoapi.com/?apikey=2bc7de0a36a1584590ac5995f5319c59&r=whois&domain='+ domainName + domainType;
        //var url = 'http://whois.nameisp.com/?apikey=2bc7de0a36a1584590ac5995f5319c59&r=whois&domain='+ domainName + domainType;

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
                console.log(chunk);
                if(data.status == 0||data.status==7){
                    var sa = new domain({
                        name: domainName + domainType,
                        status:data.registered,
                        info: data
                    });
                    sa.save(function(){
                        for(var j=domainNumber-1;j>=0;j--){
                            if(doc['serial'+j]<25){
                                doc['serial'+j]++;
                                break;
                            }else{
                                if(j==0){
                                    clearInterval(mytimer);
                                    break;
                                }else{
                                    doc['serial'+j] = 0;
                                    doc['serial'+(j-1)]++;
                                    break;
                                }
                            }
                        }
                        doc.save();
                    });
                }else{
                    console.log(data);
                }

            });
            res.on('error',function(err){
                console.log(err);
            });
        });
        req.end();
    },1100*60);
});

mongoose.connect(DB);