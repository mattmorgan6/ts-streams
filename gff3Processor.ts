import gff from '@gmod/gff';
import fs = require('fs');
import { read } from 'node:fs';

export function ParseGff3(){

    const gff3FileName: string = "./test/AU9/single_au9_gene.gff3";
    const gff3FileName2: string = "./test/au9_scaffold_subset.gff3";
    
    const gff3In = fs.createReadStream(gff3FileName2);
    const util = gff.util;

        
        gff3In.pipe(gff.parseStream())
        
        .on('data', data => {
            data.forEach(record => {
                console.log(record.attributes.Name + '\t' + record.attributes.ID);
            });
            return data
        });
        

        gff3In.on('end', () => {
            console.log('done parsing!')
        })

        
}