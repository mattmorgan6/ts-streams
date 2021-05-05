import { ReadStream, createReadStream, createWriteStream } from 'fs';
import {ParseGff3, isURL} from './gff3Processor';
const zlib = require('zlib');
import { http, https } from 'follow-redirects'

export function ParseGff3URL(urlIn: string, isGzipped: boolean){

    const unzip = zlib.createGunzip();
    const newUrl = new URL(urlIn);

    if(newUrl.protocol === 'https:'){

        https.get(urlIn, response => {
            ParseGff3(response.pipe(unzip));
            response.on('finish', function() {
                console.log('done');
            });
        }).on('error', err => {
            console.log(err);
        });

    }else{
       http.get(urlIn, response => {
            ParseGff3(response.pipe(unzip));
            response.on('finish', function() {
                console.log('done');
            });
        }).on('error', (err: Error) => {
            // if (err.code && err.code === 'ENOTFOUND')
            //     console.log("Bad file url");
            // else
            console.log(err);
        });
    }
}
