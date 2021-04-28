import {runIxIxx} from './ixixxProcessor';
import {ParseGff3} from './gff3Processor';
import fs = require('fs');
import { testSearch } from './searchIndex';
import { createReadStream } from 'fs';

/*
// For now just read in the input file to readStream for testing.
const inputFilePath: string = "./test/test1/input.txt";
const readStream = fs.createReadStream(inputFilePath);
// Test the passing in a stream to ixIxx
runIxIxx(readStream)
*/

const gff3FileName: string = "./test/two_records.gff3";
const gff3FileName2: string = "./test/au9_scaffold_subset.gff3";

const gff3In = createReadStream(gff3FileName2);
ParseGff3(gff3In);

const ixFileName: string = "out.ix";
const ixxFileName: string = "out.ixx";

testSearch("au9.g36", ixFileName, ixxFileName);