import {runIxIxx} from './ixixxProcessor';
import {ParseGff3, isURL} from './gff3Processor';
import fs = require('fs');
import { testSearch } from './searchIndex';
import { createReadStream } from 'fs';
import { ParseGff3URL} from './gff3URLProcessor';

/*
// For now just read in the input file to readStream for testing.
const inputFilePath: string = "./test/test1/input.txt";
const readStream = fs.createReadStream(inputFilePath);
// Test the passing in a stream to ixIxx
runIxIxx(readStream)
*/

const gff3FileName: string = "./test/two_records.gff3";
const gff3FileName2: string = "./test/au9_scaffold_subset.gff3";
const gff3FileName3: string = "./test/quantitative.gff3";
const gff3FileName4: string = "./test/NT_077402.2.gene.gff3";
const gff3FileName5: string = "./test/SL2.40ch10_sample.gff3";
const gff3FileName6: string = "./test/embedded_sequence.gff3";
const gff3FileName7: string = "https://github.com/GMOD/jbrowse/blob/master/tests/data/au9_scaffold_subset_sync.gff3?raw=true";

//gzip files
const gff3FileName8: string = "./test/volvox.sort.gff3.gz";
const gff3FileName9: string = "https://github.com/GMOD/jbrowse-components/blob/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz?raw=true";

const testURL: string = "https://github.com/mattmorgan6/ts-streams/blob/main/test/two_records.gff3?raw=true";


if(isURL(gff3FileName7)){
    console.log("this is a url");
    ParseGff3URL(gff3FileName7);
}else{
    const gff3In = createReadStream(gff3FileName7);
    ParseGff3(gff3In);
}


const ixFileName: string = "out.ix";
const ixxFileName: string = "out.ixx";

// testSearch("au9.g36", ixFileName, ixxFileName);