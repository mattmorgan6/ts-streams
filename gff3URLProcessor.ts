import { ReadStream, createReadStream, createWriteStream } from "fs";
import { ParseGff3, isURL } from "./gff3Processor";
import { createGunzip } from "zlib";
import { http as httpFR, https as httpsFR } from "follow-redirects";

export function ParseGff3Url(urlIn: string, isGZ: boolean) {
  if (!isGZ) {
    console.log("not gz");
    ParseGff3UrlNoGz(urlIn);
  } else {
    ParseGff3UrlWithGz(urlIn);
  }
}

function ParseGff3UrlWithGz(urlIn: string) {
  const unzip = createGunzip();
  const newUrl = new URL(urlIn);
  if (newUrl.protocol === "https:") {
    httpsFR
      .get(urlIn, (response) => {
        ParseGff3(response.pipe(unzip), null);
        response.on("finish", function () {
          console.log("done");
        });
      })
      .on("error", (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOTFOUND") console.error("Bad file url");
        else console.error("Other error: ", e);
      });
  } else {
    httpFR
      .get(urlIn, (response) => {
        ParseGff3(response.pipe(unzip), null);
        response.on("finish", function () {
          console.log("done");
        });
      })
      .on("error", (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOTFOUND") console.error("Bad file url");
        else console.error("Other error: ", e);
      });
  }
}

function ParseGff3UrlNoGz(urlIn: string) {
  const newUrl = new URL(urlIn);

  if (newUrl.protocol === "https:") {
    httpsFR
      .get(urlIn, (res) => {
        ParseGff3(res, null);
      })
      .on("error", (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOTFOUND") console.error("Bad file url");
        else console.error("Other error: ", e);
      });
  } else {
    httpFR
      .get(urlIn, (res) => {
        ParseGff3(res, null);
      })
      .on("error", (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOTFOUND") console.error("Bad file url");
        else console.error("Other error: ", e);
      });
  }
}
