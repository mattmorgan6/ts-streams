import { ReadStream, createReadStream, createWriteStream } from 'fs';
import {ParseGff3, isURL} from './gff3Processor';
//const https = require('follow-redirects');
//const http = require('follow-redirects');
const zlib = require('zlib');
import { http, https } from 'follow-redirects'


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
