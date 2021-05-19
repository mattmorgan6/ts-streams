import {ParseGff3, isURL, isGzip} from './gff3Processor';
import fs = require('fs');
import { testSearch } from './searchIndex';
import { createReadStream } from 'fs';
import { ParseGff3Url} from './gff3URLProcessor';

//local gtf
const gtf1: string = "./test/gtf/volvox.gtf";

//local GFF3
const gff3FileName: string = "./test/two_records.gff3"; //pass
const gff3FileName1: string = "./test/three_records.gff3"; //pass
const gff3FileName2: string = "./test/au9_scaffold_subset.gff3"; //pass
const gff3FileName3: string = "./test/quantitative.gff3"; // fail  I think its just the file
const gff3FileName4: string = "./test/NT_077402.2.gene.gff3"; //fail
const gff3FileName5: string = "./test/SL2.40ch10_sample.gff3"; //pass
const gff3FileName6: string = "./test/embedded_sequence.gff3"; //pass

//local GZ
const gff3FileName8: string = "./test/volvox.sort.gff3.gz"; //pass
const cotton: string = "./test/gene.Garb.CRI.gff3.gz"; // pass

//remote files
const gff3FileName7: string = "https://raw.githubusercontent.com/GMOD/jbrowse/master/tests/data/au9_scaffold_subset_sync.gff3"; //pass
const gff3FileName11: string = "https://github.com/GMOD/jbrowse-components/raw/cli_trix_indexer_stub/test_data/volvox/volvox.sort.gff3.gz"; //pass
const gff3FileName9: string = "https://github.com/GMOD/jbrowse-components/blob/cli_trix_indexer_stub/test_data/volvox/volvox.sort.gff3.gz?raw=true"; //pass
const remoteCottonFile = 'https://cottonfgd.org/about/download/annotation/gene.Garb.CRI.gff3.gz'; // pass
const testFile: string = 'http://128.206.12.216/drupal/sites/bovinegenome.org/files/data/umd3.1/Ensembl_Mus_musculus.NCBIM37.67.pep.all_vs_UMD3.1.gff3.gz'; //pass

const file: string = gff3FileName1;


if(isURL(file)){

    let isGzipped: boolean = true;
    console.log("this is a url");

    if(file.includes('.gz')){
        ParseGff3Url(file, isGzipped);
    }else{
        console.log("remote file not gz");
        isGzipped = false;
        ParseGff3Url(file, isGzipped);
    }

}else{

    const gff3In = createReadStream(file);

    if(file.includes('.gz')){
        console.log("This file is gzipped");
        isGzip(gff3In);
    }else{
        console.log("not gzipped");
        ParseGff3(gff3In);
    }
}


const ixFileName: string = "out.ix";
const ixxFileName: string = "out.ixx";

// testSearch("au9.g36", ixFileName, ixxFileName);'