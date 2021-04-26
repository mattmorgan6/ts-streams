import gff from '@gmod/gff';
// import fs = require('fs');
import { ReadStream, createReadStream } from 'fs';
import transformStream = require('stream');
import { Transform } from 'stream';
import {runIxIxx} from './ixixxProcessor';

export function ParseGff3(){

    const gff3FileName: string = "./test/two_records.gff3";
    const gff3FileName2: string = "./test/au9_scaffold_subset.gff3";

    const gff3In = createReadStream(gff3FileName);

    const gffTranform = new Transform({
        objectMode: true,
        transform: (chunk, encoding, done) => {
            chunk.forEach(record => {
                //console.log(`${record.attributes.ID} ${record.attributes.Name}\n`);
                //console.log(`${record.child_features.Name}`)
                //const res = (`${record.attributes.ID} ${record.attributes.Name}\n`);
                recurse(record);
                done(null, str);
            });
        }
    })
        
    const ReadFile: ReadStream = gff3In.pipe(gff.parseStream({parseSequences: false})).pipe(gffTranform);
        
    runIxIxx(ReadFile);
        
}


// Return a string of line-separate nameRecords
var str: string;
function recurse(record) {
    if(typeof record.child_features === "undefined"){
        console.log("bang");
    }
    str += (`${record.attributes.Name} ${record.attributes.ID}`)
    /*record.forEach(childRec => {
        recurse(childRec.child_features);
    })*/
    for(let i = 0; i < record.child_features.length;i++){
        recurse(record.child_features[i]);
    }
}

