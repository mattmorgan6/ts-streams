import { ReadStream } from 'fs';
import { createReadStream } from 'node:fs';

import {ParseGff3, isURL} from './gff3Processor';
const server = require('http').createServer();
const fs = require('fs');
const https = require("https");

export function ParseGff3URL(urlIn: string){
    
    https.get(urlIn, response => {
        ParseGff3(response);
        response.on("finish", function() {
            console.log("done");
        });
    });

    console.log("herr");

}