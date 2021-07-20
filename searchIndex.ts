import Trix from '@gmod/trix'
import {LocalFile} from 'generic-filehandle'
import { decompress } from 'lzutf8'

// Takes in a searchWord and searches the ix files using trix-js
// Then returns a json object of the result.

export async function testSearch(searchWord: string, ixFilePath: string, ixxFilePath: string) {
    const ixxFile = new LocalFile(ixxFilePath);
    const ixFile = new LocalFile(ixFilePath);
    var buff;
    var str: string;
    let searchResult: Array<string> = [];

    const trix = new Trix(ixxFile, ixFile);

    const results = await trix.search(searchWord);

    console.log("hey")
    
    results.forEach(data => {
        
        buff = (Buffer.from(data, 'base64'));
        str = buff.toString('utf8')


        searchResult.push(str);
    });

    
    console.log(`Number of results: ${searchResult.length}`);
    for (let x of searchResult)
        console.log(x);
    
}