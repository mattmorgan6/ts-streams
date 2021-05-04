import gff from '@gmod/gff';
import { ReadStream } from 'fs';
import transformStream = require('stream');
import { Transform } from 'stream';
import {runIxIxx} from './ixixxProcessor';

type RecordData = {
    attributes: any;
    start: Number;
    end: Number;
    seq_id: String;
    length:Number;
};

export function ParseGff3(gff3In: ReadStream){
    const gffTranform = new Transform({
        objectMode: true,
        transform: (chunk, _encoding, done) => {
            chunk.forEach((record: RecordData) => {
                recurseFeatures(record, gff3Stream)
                done()
            })
        }
    })
    
    const gff3Stream: ReadStream = gff3In.pipe(gff.parseStream({parseSequences: false})).pipe(gffTranform)
    
    runIxIxx(gff3Stream)
}

function recurseFeatures(record: RecordData, gff3Stream: ReadStream) {

    const recordObj = { "ID":record.attributes.ID,
                        "Name":record.attributes.Name,
                        "seq_id": record.seq_id, 
                        "start": record.start,
                        "end": record.end
                      };

    if(record.attributes.Name && record.attributes.ID){

        let buff =  Buffer.from(JSON.stringify(recordObj), 'utf-8');

        let str: string = (`${buff.toString('base64')} ${record.attributes.ID} ${record.attributes.Name} ${record.attributes.ID}\n`)
        gff3Stream.push(str);
    }

    for(let j = 0; record.length; j++){
        for(let i = 0; i < record[j].child_features.length;i++){
            recurseFeatures(record[j].child_features[i], gff3Stream);
        }
    }
}

export function isURL(FileName: string){
    let url;

    try{
        url = new URL(FileName);
    } catch (_){
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

