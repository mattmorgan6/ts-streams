import { ReadStream, createReadStream, promises, createWriteStream } from "fs";
import { Transform, PassThrough } from "stream";
import gff from "@gmod/gff";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { http as httpFR, https as httpsFR } from "follow-redirects";
import { createGunzip } from "zlib";
import { resolve } from "path";
import { type } from "os";
import { WriteStream } from "node:fs";
// let CombinedStream = require('combined-stream');
// let MultiStream = require('multistream')

// For testing:
// const gff3FileLocation: string = "./test/data/au9_scaffold_subset_sync.gff3"
// const gff3FileLocation: string = 'https://github.com/GMOD/jbrowse-components/blob/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz?raw=true'
const gff3FileLocation =
  "https://raw.githubusercontent.com/GMOD/jbrowse/master/tests/data/au9_scaffold_subset_sync.gff3";
// const gff3FileLocation = 'https://github.com/GMOD/jbrowse-components/raw/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz'
// const gff3FileLocation = 'http://128.206.12.216/drupal/sites/bovinegenome.org/files/data/umd3.1/Ensembl_Mus_musculus.NCBIM37.67.pep.all_vs_UMD3.1.gff3.gz'

// Check if the file is a URL, then index it.
/*if (isURL(gff3FileLocation))
        parseGff3Url(gff3FileLocation, false, false)
      else
        parseLocalGff3(gff3FileLocation, false, false)*/

// log(
//   'TODO: index all locally configured tracks into an aggregate, equivalent to --tracks (all_track_ids) ',
// )

// repeats_hg19
// gff3tabix_genes

const testObjs = [
  {
    attributes: ["Name", "ID", "seq_id", "start", "end"],
    indexingConfiguration: {
      gffLocation: {
        uri: "./test/au9_scaffold_subset_sync.gff3"
      },
      gzipped: true,
      indexingAdapter: "GFF3",
    },
    trackId: "gff3tabix_genes",
  },
];

const indexAttributes: Array<string> = testObjs[0].attributes;

// const uri: string = testObjs[0].indexingConfiguration.gffLocation.uri;
const uri = ["tester.gff3"]
// const uri = ["./test/three_records.gff3"]
indexDriver(uri, false, indexAttributes);

// Diagram of function call flow:

//
//                                      ------> parseGff3UrlWithGz()---\
//                                    /                                  indexGff3()
//                                  / --------> parseGff3UrlNoGz()-----/            \
//                                /                                                  \      
//               -----> parseURL()                                                    \
//              |                                                                      \
// indexDriver()                                                                        returns ----> indexDriver() -------> runIxIxx --------> output .ix and .ixx files
//              \                                                                      /                   ⇆
//               -----> parseLocalGff3()                                              /             recurseFeatures()
//                                      \                                            /
//                                       \ -----> parseLocalGZip() ---\            /
//                                        \                            indexGff3()
//                                         --------------------------/   
//

// This function takes a list of uris, as well as which attributes to index, 
// and indexes them all into one aggregate index.
// Returns a promise of the indexing child process completing.
async function indexDriver(
  uris: string | Array<string>,
  isTest: boolean,
  attributesArr: Array<string>
) {
  
  // For loop for each uri in the uri array
  if (typeof uris === "string") uris = [uris]; // turn uris string into an array of one string

  let aggregateStream = new PassThrough()
  let numStreamsFlowing = uris.length

  //  For each uri, we parse the file and add it to aggregateStream.
  for (const uri of uris) {

    // Generate transform function parses a gff stream.
    const gffTranform = new Transform({
      objectMode: true,
      transform: (chunk, _encoding, done) => {
        chunk.forEach((record: RecordData) => {
          recurseFeatures(record, gff3Stream, attributesArr);
          done();
        });
      },
    });

    let gff3Stream;
    // If it is a URL, we want to await the http request.
    if (isURL(uri)) {
      gff3Stream = await parseGff3Url(uri, uri.includes('.gz'), isTest, attributesArr);
      gff3Stream = gff3Stream.pipe(gffTranform);
    } 
    // If it is local, there is no need to await.
    else {
      gff3Stream = parseLocalGff3(uri, uri.includes('.gz'), isTest, attributesArr);
      gff3Stream = gff3Stream.pipe(gffTranform);
    }

    // Add gff3Stream to aggregateStream, and DO NOT send 'end' event on completion,
    // otherwise this would stop all streams from piping to the aggregate before completion.
    aggregateStream = gff3Stream.pipe(aggregateStream, {end: false})

    // If a stream ends we have two options:
    //  1) it is the last stream, so end the aggregate stream.
    //  2) it is not the last stream, so add a '\n' to separate streams for the indexer.
    gff3Stream.once('end', () => {
      if (--numStreamsFlowing === 0)
        aggregateStream.end()
      else
        aggregateStream.push('\n');
    })

  }

  // let x = createWriteStream("dodo.txt");
  // aggregateStream.pipe(x);

  return runIxIxx(aggregateStream, isTest);
}


// Take in the local file path, check if the
// it is gzipped or not, then passes it into the correct
// file handler.
// Returns a promise that ixIxx finishes indexing.
function parseLocalGff3(
  gff3LocalIn: string,
  isGZ: boolean,
  isTest: boolean,
  attributesArr: Array<string>
) {
  let gff3ReadStream: ReadStream = createReadStream(gff3LocalIn);
  if (!isGZ) 
    return indexGff3(gff3ReadStream);
  else 
    return parseLocalGzip(gff3ReadStream, isTest, attributesArr);
}


// Method for handing off the parsing of a gff3 file URL.
// Calls the proper parser depending on if it is gzipped or not.
// Returns a promise that the file downloads and ixIxx finishes indexing it.
async function parseGff3Url(urlIn: string, isGZ: boolean, isTest: boolean, attributesArr: Array<string>) {
  if (!isGZ)
    return parseGff3UrlNoGz(urlIn, isTest, attributesArr)
  else
    return parseGff3UrlWithGz(urlIn, isTest, attributesArr)
}


// Grabs the remote file from urlIn, then pipe it directly to parseGff3()
// for parsing and indexing. Awaits promise until the child process
// is complete and resolves the promise.
// Returns a promise that the file downloads and ixIxx finishes indexing it.
function parseGff3UrlNoGz(urlIn: string, isTest: boolean, attributesArr: Array<string>) {
  const newUrl = new URL(urlIn)

  let promise = new Promise((resolve, reject) => {
    if (newUrl.protocol === "https:") {
      httpsFR
        .get(urlIn, (res) => {
          const parseStream = indexGff3(res)
          resolve(parseStream)
        })
        .on("error", (e: NodeJS.ErrnoException) => {
          reject("fail")
          if (e.code === "ENOTFOUND") console.error("Bad file url")
          else console.error("Other error: ", e)
        })

    } else {
      httpFR
        .get(urlIn, (res) => {
          const parseStream = indexGff3(res)
          resolve(parseStream)
        })
        .on("error", (e: NodeJS.ErrnoException) => {
          reject("fail")
          if (e.code === "ENOTFOUND") console.error("Bad file url")
          else console.error("Other error: ", e)
        })
    }

  }) // End of promise

  return promise
}


// Grab the remote file from urlIn, then unzip it before
// piping into parseGff3 for parsing and indexing. Awaits 
// a promise until the child proccess is complete and
// indexing is complete.
// Returns a promise that the file downloads and ixIxx finishes indexing it.
function parseGff3UrlWithGz(urlIn: string, isTest: boolean, attributesArr: Array<string>) {
  const unzip = createGunzip()
  const newUrl = new URL(urlIn)

  let promise = new Promise((resolve, reject) => {
    if (newUrl.protocol === "https:") {
      httpsFR
      .get(urlIn, (response) => {
        const parseStream = indexGff3(response.pipe(unzip))
        resolve(parseStream)
      })
      .on("error", (e: NodeJS.ErrnoException) => {
        reject("fail")
        if (e.code === "ENOTFOUND") console.error("Bad file url")
        else console.error("Other error: ", e)
      })
    } else {
        httpFR
          .get(urlIn, (response) => {
            const parseStream = indexGff3(response.pipe(unzip))
            resolve(parseStream)
          })
          .on("error", (e: NodeJS.ErrnoException) => {
            reject("fail")
            if (e.code === "ENOTFOUND") console.error("Bad file url")
            else console.error("Other error: ", e)
          })
    }
  }) // End of promise
  return promise
}


// Checks if the passed in string is a valid URL.
// Returns a boolean.
function isURL(FileName: string) {
  let url;

  try {
    url = new URL(FileName);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// Handles local gZipped files by unzipping them
// then passing them into the parseGff3()
function parseLocalGzip(
  file: ReadStream,
  isTest: boolean,
  attributesArr: Array<string>
) {
  const unzip = createGunzip();
  let gZipRead: ReadStream = file.pipe(unzip);
  return indexGff3(gZipRead);
}

// Function that takes in a gff3 readstream and parses through
// it and retrieves the needed attributes and information.
// Returns a promise that ixIxx finishes (or errors).
function indexGff3(gff3In: ReadStream) {
  let gff3Stream: ReadStream = gff3In.pipe(
    gff.parseStream({ parseSequences: false })
  );

  return gff3Stream;
}

// Recursively goes through every record in the gff3 file and gets
// the desires attributes in the form of a JSON object. It is then pushed
// and returned to the ixIxx file to run.
async function recurseFeatures(
  record: RecordData,
  gff3Stream: ReadStream,
  attributesArr: Array<string>
) {
  let recordObj = {};
  let attrString: string = "";

  // check if the attributes array is undefined
  // breaks out of loop if it is (end of recursion)
  if (attributesArr) {
    // goes through the attributes array and checks
    // if the record contains the attribute that the
    // user wants to search by. If it contains it,
    // it adds it to the record object and attributes
    // string
    for (let attr of attributesArr) {

      if (record[attr]) {
        // Check to see if the attr exists for the record
        recordObj[attr] = record[attr];
        attrString += " " + recordObj[attr];
      } else if (record.attributes[attr]) {
        // Name and ID are in the attributes object, so check there too
        recordObj[attr] = record.attributes[attr];
        attrString += " " + recordObj[attr];
      }
    }

    // encodes the record object so that it can be used by ixIxx
    // appends the attributes that we are indexing by to the end
    // of the string before pushing to ixIxx
    let buff = Buffer.from(JSON.stringify(recordObj), "utf-8");
    let str: string = `${buff.toString("base64")}`;
    str += attrString + "\n";

    gff3Stream.push(str);
  } else {  
    return;
  }

  // recurses through each record to get child features and
  // parses their attributes as well.
  if (record.length) {
    for (let j = 0; record.length; j++) {
      for (let i = 0; i < record[j].child_features.length; i++) {
        recurseFeatures(record[j].child_features[i], gff3Stream, attributesArr);
      }
    }
  }
  // else{
  //   for (let i = 0; i < record[j].child_features.length; i++) {
  //     recurseFeatures(record[j].child_features[i], gff3Stream, attributesArr);
  //   }
  // }
}

// Given a readStream of data, indexes the stream into .ix and .ixx files using ixIxx.
// The ixIxx executable is required on the system path for users, however tests use a local copy.
// Returns a promise around ixIxx completing (or erroring).
function runIxIxx(readStream: ReadStream | PassThrough, isTest: boolean) {
  const ixFileName: string = "out.ix";
  const ixxFileName: string = "out.ixx";

  let ixProcess: ChildProcessWithoutNullStreams;

  if (isTest)
    // If this is a test, output to test/data/ directory, and use the local version of ixIxx.
    ixProcess = spawn(
      "cat | ./products/jbrowse-cli/test/ixIxx /dev/stdin",
      [
        "./products/jbrowse-cli/test/data/out.ix",
        "./products/jbrowse-cli/test/data/out.ixx",
      ],
      { shell: true }
    );
  // Otherwise require user to have ixIxx in their system path.
  else
    ixProcess = spawn("cat | ixIxx /dev/stdin", [ixFileName, ixxFileName], {
      shell: true,
    });

  // Pass the readStream as stdin into ixProcess.
  readStream.pipe(ixProcess.stdin);

  // End the ixProcess stdin when the stream is done.
  readStream.on("end", () => {
    ixProcess.stdin.end();
  });

  ixProcess.stdout.on("data", (data) => {
    console.log(`Output from ixIxx: ${data}`);
  });

  let promise = new Promise((resolve, reject) => {
    ixProcess.on("close", (code) => {
      if (code == 0) {
        resolve("Success!");
        // Code should = 0 for success
        console.log(
          `Indexing done! Check ${ixFileName} and ${ixxFileName} files for output.`
        );
        return code;
      } else {
        reject("fail");
        console.error(`ixIxx exited with code: ${code}`);
      }
    });

    // Hook up the reject from promise on error
    ixProcess.stderr.on("data", (data) => {
      reject("fail");
      console.error(`Error with ixIxx: ${data}`);
    });
  });

  return promise;
}
