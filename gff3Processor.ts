import gff from '@gmod/gff';
import fs = require('fs');
import transformStream = require('stream');
import { createWriteStream, read } from 'node:fs';
import { Transform } from 'stream';
import {runIxIxx} from './ixixxProcessor';


export function ParseGff3(){

    const gff3FileName: string = "./test/AU9/single_au9_gene.gff3";
    const gff3FileName2: string = "./test/au9_scaffold_subset.gff3";

    const gff3In = fs.createReadStream(gff3FileName2);

        const gffTranform = new Transform({
            objectMode: true,
            transform: (chunk, encoding, done) => {
                var res;
                chunk.forEach(record => {
                    console.log(record.attributes.ID + " " + record.attributes.Name);
                    res = (record.attributes.ID + " " + record.attributes.Name + '\n');
                    
                });
                done(null, res);
            }
        })
        
        let test: fs.ReadStream = gff3In.pipe(gff.parseStream({parseSequences: false})).pipe(gffTranform);

        /*.on('data', data => {
            data.forEach(record => {
                
                console.log(record.attributes.ID + " " + record.attributes.Name);
            });
        });

        //gff3In.pipe(gffTranform).pipe(fs.createWriteStream('out.txt'))
    
        gff3In.on('end', () => {
            console.log('done parsing!')
        });*/
        
        runIxIxx(test);
        
}