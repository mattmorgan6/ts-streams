import {runIxIxx} from './ixixxProcessor';
import {ParseGff3} from './gff3Processor';
import fs = require('fs');

/*
// For now just read in the input file to readStream for testing.
const inputFilePath: string = "./test/test1/input.txt";
const readStream = fs.createReadStream(inputFilePath);
// Test the passing in a stream to ixIxx
runIxIxx(readStream)
*/

ParseGff3();