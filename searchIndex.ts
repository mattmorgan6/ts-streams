import Trix from '@gmod/trix'
import {LocalFile} from 'generic-filehandle'

// Takes in a searchWord and searches the ix files using trix-js
// Then returns a json object of the result.

export async function testSearch(searchWord: string, ixFilePath: string, ixxFilePath: string) {
    const ixxFile = new LocalFile(ixxFilePath);
    const ixFile = new LocalFile(ixFilePath);
    var buff;
    let searchResult: Array<string> = [];

    const trix = new Trix(ixxFile, ixFile);

    const results = await trix.search(searchWord);

    
    results.forEach(data => {
        buff = Buffer.from(data, 'base64');
        searchResult.push(buff.toString('utf-8'));
    });

    
    console.log(`Number of results: ${searchResult.length}`);
    for (let x of searchResult)
        console.log(x);
    
}