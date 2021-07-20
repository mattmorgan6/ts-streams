
import { ReadStream, createReadStream, appendFile, unlink} from "fs";
import { Transform, PassThrough } from "stream";
import gff from "@gmod/gff";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { FollowResponse, http as httpFR, https as httpsFR } from "follow-redirects";
import { createGunzip, Gunzip } from "zlib";
import { testSearch } from "./searchIndex";
import { IncomingMessage } from "node:http";
import path = require("path");

// let CombinedStream = require('combined-stream');
// let MultiStream = require('multistream')

// For testing:
// const gff3FileLocation: string = "./test/data/au9_scaffold_subset_sync.gff3"
// const gff3FileLocation: string = 'https://github.com/GMOD/jbrowse-components/blob/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz?raw=true'
//const gff3FileLocation =
  //"https://raw.githubusercontent.com/GMOD/jbrowse/master/tests/data/au9_scaffold_subset_sync.gff3";
 const gff3FileLocation = 'https://github.com/GMOD/jbrowse-components/raw/cli_trix_indexer/test_data/volvox/volvox.sort.gff3.gz'
// const gff3FileLocation = 'http://128.206.12.216/drupal/sites/bovinegenome.org/files/data/umd3.1/Ensembl_Mus_musculus.NCBIM37.67.pep.all_vs_UMD3.1.gff3.gz'

const testObjs = [
  {
    attributes: ["seq_id"],
    indexingConfiguration: {
      gffLocation: {
        uri: "./test/volvox.sort.gff3.gz"
      },
      gzipped: true,
      indexingAdapter: "GFF3",
    },
    trackId: "gff3tabix_genes",
  },
];

const indexAttributes: Array<string> = ["Name", "ID", "description", "type"]
console.log(indexAttributes)

const uri: string = testObjs[0].indexingConfiguration.gffLocation.uri;
const uri2 = ["./test/au9_scaffold_subset.gff3"]
//const uri = ["./test/three_records.gff3"]
//const uri = ["./test/three_records.gff3", "./test/two_records.gff3"]
indexDriver(uri2, false, indexAttributes, './')
testSearch('apple', './out.ix', './out.ixx')

  // Diagram of function call flow:

  //
  //                                      ------> handleGff3UrlWithGz()---\
  //                                    /                                  parseGff3Stream()
  //                                  / --------> handleGff3UrlNoGz()-----/                 \
  //                                /                                                        \
  //               -----> handleURL()                                                         \
  //              |                                                                            \
  // indexDriver()                                                                          returns ----> indexDriver() -------> runIxIxx --------> output .ix and .ixx files
  //              \                                                                            /               ⇆
  //               -----> handleLocalGff3()                                                   /         recurseFeatures()
  //                                      \                                                 /
  //                                       \ -----> parseLocalGZip() ---\                 /
  //                                        \                            parseGff3Stream()
  //                                         --------------------------/
  //

  // This function takes a list of uris, as well as which attributes to index,
  // and indexes them all into one aggregate index.
  // Returns a promise of the indexing child process completing.
  async function indexDriver(
    uris: string | Array<string>,
    isTest: boolean,
    attributesArr: Array<string>,
    outLocation: string,
  ) {
    // deletes the meta.json file so we can make a new one
    unlink('meta.json', (err => {
      if (err) throw err
    }))

    // For loop for each uri in the uri array
    if (typeof uris === 'string') {
      uris = [uris]
    } // turn uris string into an array of one string

    let aggregateStream = new PassThrough()
    let numStreamsFlowing = uris.length

    //  For each uri, we parse the file and add it to aggregateStream.
    for (const uri of uris) {
      // Generate transform function parses an @gmod/gff stream.
      const gffTranform = new Transform({
        objectMode: true,
        transform: (chunk, _encoding, done) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chunk.forEach((record: any) => {
            recurseFeatures(record, gff3Stream, attributesArr)
            done()
          })
        },
      })

      let gff3Stream: ReadStream | Transform
      // If it is a URL, we want to await the http request.
      if (isURL(uri)) {
        gff3Stream = await handleGff3Url(uri, uri.includes('.gz'))
        gff3Stream = gff3Stream.pipe(gffTranform)
      }
      // If it is local, there is no need to await.
      else {
        gff3Stream = await handleLocalGff3(uri, uri.includes('.gz'))
        gff3Stream = gff3Stream.pipe(gffTranform)
      }

      // Add gff3Stream to aggregateStream, and DO NOT send 'end' event on completion,
      // otherwise this would stop all streams from piping to the aggregate before completion.
      aggregateStream = gff3Stream.pipe(aggregateStream, { end: false })

      // If a stream ends we have two options:
      //  1) it is the last stream, so end the aggregate stream.
      //  2) it is not the last stream, so add a '\n' to separate streams for the indexer.

      // eslint-disable-next-line no-loop-func
      gff3Stream.once('end', () => {
        if (--numStreamsFlowing === 0) {
          aggregateStream.end()
        } else {
          aggregateStream.push('\n')
        }
      })
    }

    return runIxIxx(aggregateStream, isTest, outLocation)
  }

  // Take in the local file path, check if the it is gzipped or not,
  // then passes it into the correct file handler.
  // Returns a @gmod/gff stream.
  async function handleLocalGff3(gff3LocalIn: string, isGZ: boolean) {
    const gff3ReadStream: ReadStream = createReadStream(gff3LocalIn)
    if (!isGZ) {
      return parseGff3Stream(gff3ReadStream)
    } else {
      return handleLocalGzip(gff3ReadStream)
    }
  }

  // Method for handing off the parsing of a gff3 file URL.
  // Calls the proper parser depending on if it is gzipped or not.
  // Returns a @gmod/gff stream.
  async function handleGff3Url(urlIn: string, isGZ: boolean): Promise<ReadStream> {
    if (!isGZ) {
      return handleGff3UrlNoGz(urlIn)
    } else {
      return handleGff3UrlWithGz(urlIn)
    }
  }

  // Grabs the remote file from urlIn, then pipe it directly to parseGff3Stream()
  // for parsing and indexing.
  // Returns a promise for the resulting @gmod/gff stream.
  async function handleGff3UrlNoGz(urlIn: string) {
    const newUrl = new URL(urlIn)

    const promise = new Promise<ReadStream>((resolve, reject) => {
      if (newUrl.protocol === 'https:') {
        httpsFR
          .get(urlIn, (response: IncomingMessage & FollowResponse) => {
            const parseStream =  parseGff3Stream(response)
            resolve(parseStream)
          })
          .on('error', (e: NodeJS.ErrnoException) => {
            reject('fail')
            if (e.code === 'ENOTFOUND') {
               console.error('Bad file url')
            } else {
               console.error('Other error: ', e)
            }
          })
      } else {
        httpFR
          .get(urlIn, (response: IncomingMessage & FollowResponse) => {
            const parseStream =  parseGff3Stream(response)
            resolve(parseStream)
          })
          .on('error', (e: NodeJS.ErrnoException) => {
            reject('fail')
            if (e.code === 'ENOTFOUND') {
               console.error('Bad file url')
            } else {
               console.error('Other error: ', e)
            }
          })
      }
    }) // End of promise

    return promise
  }

  // Grab the remote file from urlIn, then unzip it before
  // piping into parseGff3Stream for parsing.
  // Returns a promise for the resulting @gmod/gff stream.
  async function handleGff3UrlWithGz(urlIn: string) {
    const unzip = createGunzip()
    const newUrl = new URL(urlIn)

    const promise = new Promise<ReadStream>((resolve, reject) => {
      if (newUrl.protocol === 'https:') {
        httpsFR
          .get(urlIn, (response: IncomingMessage & FollowResponse) => {
            const parseStream = parseGff3Stream(response.pipe(unzip))
            resolve(parseStream)
          })
          .on('error', (e: NodeJS.ErrnoException) => {
            reject('fail')
            if (e.code === 'ENOTFOUND') {
               console.error('Bad file url')
            } else {
               console.error('Other error: ', e)
            }
          })
      } else {
        httpFR
          .get(urlIn, (response: IncomingMessage & FollowResponse) => {
            const parseStream =  parseGff3Stream(response.pipe(unzip))
            resolve(parseStream)
          })
          .on('error', (e: NodeJS.ErrnoException) => {
            reject('fail')
            if (e.code === 'ENOTFOUND') {
               console.error('Bad file url')
            } else {
               console.error('Other error: ', e)
            }
          })
      }
    }) // End of promise
    return promise
  }

  // Checks if the passed in string is a valid URL.
  // Returns a boolean.
  function isURL(FileName: string) {
    let url

    try {
      url = new URL(FileName)
    } catch (_) {
      return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
  }

  // Handles local gZipped files by unzipping them
  // then passing them into the parseGff3()
  // Returns a @gmod/gff stream.
  function handleLocalGzip(file: ReadStream) {
    const unzip = createGunzip()
    const gZipRead = file.pipe(unzip)
    return  parseGff3Stream(gZipRead)
  }

  // Function that takes in a gff3 readstream and parses through
  // it and retrieves the needed attributes and information.
  // Returns a @gmod/gff stream.
  function parseGff3Stream(
    gff3In: ReadStream | (IncomingMessage & FollowResponse) | Gunzip,
  ) {
    const gff3Stream: ReadStream = gff3In.pipe(
      gff.parseStream({ parseSequences: false }),
    )

    return gff3Stream
  }

  // Recursively goes through every record in the gff3 file and gets
  // the desired attributes in the form of a JSON object. It is then
  // pushed to gff3Stream in proper indexing format.
  async function recurseFeatures(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    record: any,
    gff3Stream: ReadStream | Transform,
    attributesArr: Array<string>,
  ) {
    // check if the attributes array is undefined
    // breaks out of loop if it is (end of recursion)
    if (attributesArr) {
      // goes through the attributes array and checks
      // if the record contains the attribute that the
      // user wants to search by. If it contains it,
      // it adds it to the record object and attributes
      // string

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getAndPushRecord = (subRecord: any) => {
        const locStr = `${subRecord['seq_id']};${subRecord['start']}..${subRecord['end']}`
        let arr = []
        let attrString: Array<string> = []

        arr.push(locStr)
        attrString.push('locstring')

        for (const attr of attributesArr) {
          
          // Check to see if the attr exists for the record
          if (subRecord[attr]) {
            arr.push(subRecord[attr])
            attrString.push(attr)
          } else if (subRecord.attributes && subRecord.attributes[attr]) {
            // Name and ID are in the attributes object, so check there too
            arr.push(subRecord.attributes[attr])
            attrString.push(attr)
          }
        }

        // encodes the record object so that it can be used by ixIxx
        // appends the attributes that we are indexing by to the end
        // of the string before pushing to ixIxx
        const buff = Buffer.from(JSON.stringify(arr)).toString('base64')
        const fieldNames = JSON.stringify(attrString) + '\n'

        appendFile('meta.json', fieldNames, function(err){
          if (err) throw err
        })

        appendFile('OUTIX.json', buff, function(err){
          if (err) throw err
        })

        gff3Stream.push(`${buff}\n`)
      }

      if (Array.isArray(record)) {
        record.forEach(r => getAndPushRecord(r))
      } else {
        getAndPushRecord(record)
      }
    } else {
      return
    }

    // recurses through each record to get child features and
    // parses their attributes as well.

    if (record.child_features || record[0].child_features) {
      if (Array.isArray(record)) {
        for (const r of record) {
          for (let i = 0; i < record[0].child_features.length; i++) {
             recurseFeatures(r.child_features[i], gff3Stream, attributesArr)
          }
        }
      } else {
        for (let i = 0; i < record['child_features'].length; i++) {
           recurseFeatures(
            record.child_features[i],
            gff3Stream,
            attributesArr,
          )
        }
      }
    }
  }

  // Given a readStream of data, indexes the stream into .ix and .ixx files using ixIxx.
  // The ixIxx executable is required on the system path for users, however tests use a local copy.
  // Returns a promise around ixIxx completing (or erroring).
  function runIxIxx(
    readStream: ReadStream | PassThrough,
    isTest: boolean,
    outLocation: string,
  ) {
    const ixFileName = 'out.ix'
    const ixxFileName = 'out.ixx'

    let ixProcess: ChildProcessWithoutNullStreams

    if (isTest) {
      // If this is a test, output to test/data/ directory, and use the local version of ixIxx.
      ixProcess = spawn(
        `cat | ${path.join(__dirname, '..', '..', 'test', 'ixIxx')} /dev/stdin`,
        [
          `${path.join(__dirname, '..', '..', 'test', 'data', 'out.ix')}`,
          `${path.join(__dirname, '..', '..', 'test', 'data', 'out.ixx')}`,
        ],
        { shell: true },
      )
    }
    // Otherwise require user to have ixIxx in their system path.
    else {
      ixProcess = spawn(
        'cat | ixIxx /dev/stdin',
        [
          `${path.join(outLocation, ixFileName)}`,
          `${path.join(outLocation, ixxFileName)}`,
        ],
        {
          shell: true,
        },
      )
    }

    // Pass the readStream as stdin into ixProcess.
    readStream.pipe(ixProcess.stdin).on('error', e => {
       console.error(`Error writing data to ixIxx. ${e}`)
    })

    // End the ixProcess stdin when the stream is done.
    readStream.on('end', () => {
      ixProcess.stdin.end()
    })

    ixProcess.stdout.on('data', data => {
      console.log(`Output from ixIxx: ${data}`)
    })

    const promise = new Promise((resolve, reject) => {
      ixProcess.on('close', code => {
        if (code === 0) {
          resolve('Success!')
          // Code should = 0 for success
          console.log(
            `Indexing done! Check ${ixFileName} and ${ixxFileName} files for output.`,
          )
          return code
        } else {
          reject(`ixIxx exited with code: ${code}`)
          return code
        }
      })

      // Hook up the reject from promise on error
      ixProcess.stderr.on('data', data => {
        reject(`Error with ixIxx: ${data}`)
      })
    }).catch(errorData => {
      // Catch any promise rejection errors with running ixIxx here.

      if (errorData.includes('not found')) {
         console.error('ixIxx was not found in your system.')
      } else {
         console.error(errorData)
      }
    })

    return promise
  }

  // Function that takes in an array of tracks and returns an array of
  // identifiers stating what will be indexed.
  // Params:
  //  trackIds: array of string ids for tracks to index
  //  runFlags: specify if there is a target ouput location for the indexing
  

