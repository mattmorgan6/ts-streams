import { ReadStream, createReadStream, createWriteStream } from 'fs';
import {ParseGff3, isURL} from './gff3Processor';
const zlib = require('zlib');
import { http, https } from 'follow-redirects'
//const http = require('http');

export function ParseGff3URL(urlIn: string, isGZ: boolean){

    const unzip = zlib.createGunzip();
    const newUrl = new URL(urlIn);

        if(!isGZ){
            console.log("not gz");
            ParseGff3URLNoGZ(urlIn);

        }else{
            if(newUrl.protocol === 'https:'){

                https.get(urlIn, response => {
                    ParseGff3(response.pipe(unzip));
                    response.on('finish', function() {
                        console.log('done');
                    });
                }).on('error', (e: NodeJS.ErrnoException) => {
                    if (e.code === 'ENOTFOUND')
                        console.error("Bad file url");
                    else
                        console.error("Other error: ", e)
        
                });
        
            }else{
            http.get(urlIn, response => {
                    ParseGff3(response.pipe(unzip));
                    response.on('finish', function() {
                        console.log('done');
                    })
                }).on('error', (e: NodeJS.ErrnoException) => {
                    if (e.code === 'ENOTFOUND')
                        console.error("Bad file url");
                    else
                        console.error("Other error: ", e)
        
                });
        }  
    }
}

function ParseGff3URLNoGZ(urlIn: string){
    const newUrl = new URL(urlIn);

    if(newUrl.protocol === 'https:'){
        var str: string = "";
        https.get(urlIn, response => {
            response.on('data', chunk => {
                //str += chunk;
                //ParseGff3(chunk);
                response.on('finish', function() {
                    let urlReadStream = createReadStream(str);
                    ParseGff3(chunk);
                });
            });
            
        }).on('error', (e: NodeJS.ErrnoException) => {
            if (e.code === 'ENOTFOUND')
                console.error("Bad file url");
            else
                console.error("Other error: ", e)

        });
    }else{
       http.get(urlIn, response => {
            let urlReadStream = createReadStream(newUrl);
            ParseGff3(urlReadStream);
            response.on('finish', function() {
                console.log('done');
            })
        }).on('error', (e: NodeJS.ErrnoException) => {
            if (e.code === 'ENOTFOUND')
                console.error("Bad file url");
            else
                console.error("Other error: ", e)

        });
    }
}