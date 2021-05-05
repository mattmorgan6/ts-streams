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

const gff3FileName: string = "./test/two_records.gff3"; //pass
const gff3FileName2: string = "./test/au9_scaffold_subset.gff3"; //pass
const gff3FileName3: string = "./test/quantitative.gff3"; // fail
const gff3FileName4: string = "./test/NT_077402.2.gene.gff3"; //fail
const gff3FileName5: string = "./test/SL2.40ch10_sample.gff3"; //pass
const gff3FileName6: string = "./test/embedded_sequence.gff3"; //pass
const gff3FileName7: string = "https://raw.githubusercontent.com/GMOD/jbrowse/master/tests/data/au9_scaffold_subset_sync.gff3"; //headercheck
const gff3FileName11: string = "https://github.com/GMOD/jbrowse-components/raw/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz"; //headercheck

//gzip files
const gff3FileName8: string = "./test/volvox.sort.gff3.gz"; //error out.ix is empty
const gff3FileName9: string = "https://github.com/GMOD/jbrowse-components/blob/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz?raw=true"; //headercheck
const cotton: string = "./test/gene.Garb.CRI.gff3.gz"; // fail out.ix is empty

// https://github.com/GMOD/jbrowse-components/raw/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz

const remoteCottonFile = 'https://cottonfgd.org/about/download/annotation/gene.Garb.CRI.gff3.gz'; // pass
const testFile: string = 'http://128.206.12.216/drupal/sites/bovinegenome.org/files/data/umd3.1/Ensembl_Mus_musculus.NCBIM37.67.pep.all_vs_UMD3.1.gff3.gz'; //pass

const file: string = gff3FileName9;

if(isURL(file)){
    console.log("this is a url");
    ParseGff3URL(file);
}else{
    const gff3In = createReadStream(file);
    ParseGff3(gff3In);
}


const ixFileName: string = "out.ix";
const ixxFileName: string = "out.ixx";

// testSearch("au9.g36", ixFileName, ixxFileName);'