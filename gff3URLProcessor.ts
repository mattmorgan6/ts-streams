import { ReadStream, createReadStream, createWriteStream } from 'fs';
import {ParseGff3, isURL} from './gff3Processor';
const https = require("https");
const http = require('http');
const zlib = require('zlib');

export function ParseGff3URL(urlIn: string){

    const unzip = zlib.createGunzip();
    const newUrl = new URL(urlIn);


    if(newUrl.protocol === 'https:'){

        https.get(urlIn, response => {
            ParseGff3(response.pipe(unzip));
            response.on("finish", function() {
                console.log("done");
            });
        });

    }else{

       http.get(urlIn, response => {
            ParseGff3(response.pipe(unzip));
            response.on("finish", function() {
                console.log("done");
            });
        });

    }
}

function get({path, host}, callback){
    http.get({
        path,
        host
    }, function(response){
        if(response.headers.location){
            var loc = response.headers.location;
            if(loc.match(/^http/)){
                loc = new URL(loc);
                host = loc.host;
                path = loc.path;
            }else{
                path = loc;
            }
            get({host, path}, callback);
        }else{
            callback(response);
        }
    });
}