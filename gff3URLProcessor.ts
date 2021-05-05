import { ReadStream, createReadStream, createWriteStream } from 'fs';
import {ParseGff3, isURL} from './gff3Processor';
const https = require("https");
const zlib = require('zlib');

export function ParseGff3URL(urlIn: string){
    
    // For local file testing:
    // const fileContents = createReadStream('./test/gene.Garb.CRI.gff3.gz');
    // const writeStream = createWriteStream('./file2.txt');
    
    // const unzip = zlib.createInflate()
    // fileContents.pipe(unzip).pipe(writeStream);
    // ParseGff3(unzip.pipe());

    const unzip = zlib.createGunzip();
    
    https.get(urlIn, response => {
        ParseGff3(response.pipe(unzip));
        response.on("finish", function() {
            console.log("done");
        });
    });
}