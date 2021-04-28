import {runIxIxx} from './ixixxProcessor';
import {ParseGff3} from './gff3Processor';
import fs = require('fs');
import { testSearch } from './searchIndex';

/*
// For now just read in the input file to readStream for testing.
const inputFilePath: string = "./test/test1/input.txt";
const readStream = fs.createReadStream(inputFilePath);
// Test the passing in a stream to ixIxx
runIxIxx(readStream)
*/

ParseGff3();

const ixFileName: string = "out.ix";
const ixxFileName: string = "out.ixx";

testSearch("au9.g36", ixFileName, ixxFileName);