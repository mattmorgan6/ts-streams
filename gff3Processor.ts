import gff from "@gmod/gff";
import { ReadStream } from "fs";
import { Transform } from "stream";
import { runIxIxx } from "./ixixxProcessor";
import { Gunzip } from "zlib";

// Record object definitions
type RecordData = {
  attributes: any;
  start: Number;
  end: Number;
  seq_id: String;
  length: Number;
};

// function that takes in a gff3 readstream and parses through
// it and retrieves the needed attributes and information
export function ParseGff3(gff3In: ReadStream | Gunzip) {
  const gffTranform = new Transform({
    objectMode: true,
    transform: (chunk, _encoding, done) => {
      chunk.forEach((record: RecordData) => {
        recurseFeatures(record, gff3Stream);
        done();
      });
    },
  });

  const gff3Stream: ReadStream = gff3In
    .pipe(gff.parseStream({ parseSequences: false }))
    .pipe(gffTranform);

  runIxIxx(gff3Stream);
}

// Recursively goes through every record in the gff3 file and gets
// the desires attributes in the form of a JSON object. It is then pushed
// and returned to the ixIxx file to run.
function recurseFeatures(record: RecordData, gff3Stream: ReadStream) {
  const recordObj = {
    ID: record.attributes.ID,
    Name: record.attributes.Name,
    seq_id: record.seq_id,
    start: record.start,
    end: record.end,
  };

  if (record.attributes.Name && record.attributes.ID) {
    let buff = Buffer.from(JSON.stringify(recordObj), "utf-8");

    let str: string = `${buff.toString("base64")} ${record.attributes.ID} ${
      record.attributes.Name
    } ${record.attributes.ID}\n`;
    gff3Stream.push(str);
  }

  for (let j = 0; record.length; j++) {
    for (let i = 0; i < record[j].child_features.length; i++) {
      recurseFeatures(record[j].child_features[i], gff3Stream);
    }
  }
}

// Checks if the passed in string is a valid 
// URL. Will return a boolean
export function isURL(FileName: string) {
  let url;

  try {
    url = new URL(FileName);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// Checks if the input readstrea is gzipped
// or not. Will return a boolean.
export function isGzip(file: ReadStream) {
  const unzip = zlib.createGunzip();

  let gZipRead: ReadStream = file.pipe(unzip);
  ParseGff3(gZipRead);
}
