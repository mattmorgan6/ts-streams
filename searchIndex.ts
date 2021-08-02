import Trix from '@gmod/trix'
import {LocalFile} from 'generic-filehandle'
const fs = require('fs');

// Takes in a searchWord and searches the ix files using trix-js
// Then returns a json object of the result.

export async function testSearch(searchWord: string, ixFilePath: string, ixxFilePath: string) {
    const ixxFile = new LocalFile(ixxFilePath);
    const ixFile = new LocalFile(ixFilePath);
    var buff;
    let searchResult: Array<string> = [];
    const trix = new Trix(ixxFile, ixFile);
    const results = await trix.search(searchWord);
    
    let attr = fs.readFileSync('meta.json')
    let json = JSON.parse(attr).split(',')
    

    results.forEach(data => {
        let arr = []
        buff = Buffer.from(data, 'base64').toString('utf8').split(',');

        for(let x in buff) {
            if(!buff[x].includes('placeholder')){
                arr.push(`${json[x]}:${buff[x]}`)
            }
        }
       
        searchResult.push(arr.toString());
    });

    
    console.log(`Number of results: ${searchResult.length}`);
    for (let x of searchResult)
        console.log(x);
    
}