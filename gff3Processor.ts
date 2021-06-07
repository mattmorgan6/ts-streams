// import gff from "@gmod/gff";
// import { ReadStream } from "fs";
// import { Transform } from "stream";
// import { runIxIxx } from "./ixixxProcessor";
// import { Gunzip, createGunzip } from "zlib";

// // Record object definitions
// type RecordData = {
//   attributes: any;
//   start: Number;
//   end: Number;
//   seq_id: String;
//   length: Number;
// };

// // Function that takes in a gff3 readstream and parses through
// // it and retrieves the needed attributes and information.
// export function ParseGff3(gff3In: ReadStream | Gunzip, gff3In2: ReadStream | Gunzip) {
//   const gffTranform = new Transform({
//     objectMode: true,
//     transform: (chunk, _encoding, done) => {
//       chunk.forEach((record: RecordData) => {
//         recurseFeatures(record, gff3Stream);
//         done();
//       });
//     },
//   });


//   // HERE!!!

//   const gff3Stream: ReadStream = gff3In
//     .pipe(gff.parseStream({ parseSequences: false }))
//     .pipe(gffTranform);

//   const gff3Stream2: ReadStream = gff3In2
//     .pipe(gff.parseStream({ parseSequences: false }))
//     .pipe(gffTranform);

//   runIxIxx(gff3Stream, gff3Stream2);
// }

// // Recursively goes through every record in the gff3 file and gets
// // the desires attributes in the form of a JSON object. It is then pushed
// // and returned to the ixIxx file to run.
// function recurseFeatures(record: RecordData, gff3Stream: ReadStream) {
  

//   const testObjs =  [
//                         {
//                             "attributes": ["Name", "ID", "seq_id", "start", "end"],
//                             "indexingConfiguration": {
//                                 "gffLocation": {
//                                     "uri": "test/data/volvox.sort.gff3.gz",
//                                 },
//                                 "gzipped": true,
//                                 "indexingAdapter": "GFF3",
//                             },
//                             "trackId": "gff3tabix_genes",
//                         },
//                     ];
            
//     // create a for loop going through testObj attributes array
//     // add each attribute to recordObj. 

//     const attributesArr: Array<string> = testObjs[0].attributes;

//     let recordObj = {};
//     let attrString: string = "";


//     for(let attr of attributesArr){
//         if(record[attr]){
//           // Check to see if the attr exists for the record
//           recordObj[attr] = record[attr]
//           attrString += ' '
//           attrString += recordObj[attr]
//         }
//         else if (record.attributes[attr]) {
//           // Name and ID are in the attributes object, so check there too
//           recordObj[attr] = record.attributes[attr]
//           attrString += ' '
//           attrString += recordObj[attr]
//         }
//     }

//     let buff = Buffer.from(JSON.stringify(recordObj), "utf-8");
//     let str: string = `${buff.toString("base64")}`;
//     str += attrString;


//     // for loop to get every attribute and add it to a string
//     // at the end of the for loop append the attribute string to the
//     // base64 buffer then push
   
    
//     gff3Stream.push(str);

//   for (let j = 0; record.length; j++) {
//     for (let i = 0; i < record[j].child_features.length; i++) {
//       recurseFeatures(record[j].child_features[i], gff3Stream);
//     }
//   }
// }

// // Checks if the passed in string is a valid 
// // URL. Will return a boolean
// export function isURL(FileName: string) {
//   let url;

//   try {
//     url = new URL(FileName);
//   } catch (_) {
//     return false;
//   }

//   return url.protocol === "http:" || url.protocol === "https:";
// }

// // Checks if the input readstrea is gzipped
// // or not. Will return a boolean.
// export function isGzip(file: ReadStream) {
//   const unzip = createGunzip();

//   let gZipRead: ReadStream = file.pipe(unzip);
//   ParseGff3(gZipRead);
// }
