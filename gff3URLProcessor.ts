const request = require('request');
import { ReadStream } from 'fs';
import {ParseGff3, isURL} from './gff3Processor';
const server = require('http').createServer();
const fs = require('fs');

export function ParseGff3URL(urlIn: string){
    

    console.log("accessed function");
    var src;

    server.on('request', (req, res) => {
        src = fs.createReadStream(urlIn);
        ParseGff3(src);
    });


    //ParseGff3(src);
}