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
                let str: string = recurse(record);
                done(null, str);
            });
        }
    })
        
    const gff3Stream: ReadStream = gff3In.pipe(gff.parseStream({parseSequences: false})).pipe(gffTranform);
        
    runIxIxx(gff3Stream);
}


function recurse(record) {
    let str: string = "";
    if(record.attributes.Name && record.attributes.ID){
        str = (`${record.attributes.ID} ${record.attributes.Name} ${record.attributes.ID}\n`)
    }

    for(let j = 0; record.length; j++){
        for(let i = 0; i < record[j].child_features.length;i++){
            str += recurse(record[j].child_features[i]);
        }
    }
    return str;
}

