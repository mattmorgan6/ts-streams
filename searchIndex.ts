import Trix from '@gmod/trix'
import {LocalFile} from 'generic-filehandle'

// Takes in a searchWord and searches the ix files using trix-js
// Then returns a json object of the result.

export async function doStuff(searchWord: string, ixFilePath: string, ixxFilePath: string) {
    const ixxFile = new LocalFile(ixxFilePath);
    const ixFile = new LocalFile(ixFilePath);

    const trix = new Trix(ixxFile, ixFile);

    const results = await trix.search(searchWord);


    results.forEach(data => {
        const buff = Buffer.from(data, 'base64');
        console.log(buff.toString('utf-8'));
    });
    
    //console.log(results);
}