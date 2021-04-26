import gff from '@gmod/gff';
// import fs = require('fs');
import { ReadStream, createReadStream } from 'fs';
import transformStream = require('stream');
import { Transform } from 'stream';
import {runIxIxx} from './ixixxProcessor';

export function ParseGff3(){

    const gff3FileName: string = "./test/au9_scaffold_subset_sync.gff3";
    const gff3FileName2: string = "./test/au9_scaffold_subset.gff3";

    const gff3In = createReadStream(gff3FileName);

    const gffTranform = new Transform({
        objectMode: true,
        transform: (chunk, encoding, done) => {
            chunk.forEach(record => {
                //console.log(`${record.attributes.ID} ${record.attributes.Name}\n`);
                const res = (`${record.attributes.ID} ${record.attributes.Name}\n`);
                done(null, res);
            });
        }
    })
        
    const ReadFile: ReadStream = gff3In.pipe(gff.parseStream({parseSequences: false})).pipe(gffTranform);
        
    runIxIxx(ReadFile);
        
}

/*
// Return a string of line-separate nameRecords
global str: string
function recurse(record) {
    str += ID and name...
    for each child_feature
        recurse(record.child_feature[i])

}

*/