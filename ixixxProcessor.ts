import { spawn }  from 'child_process';
import { ReadStream}  from 'fs';
import { read } from 'node:fs';

export function runIxIxx(readStream: ReadStream, readStream2: ReadStream){
    const ixFileName: string = "out.ix";
    const ixxFileName: string = "out.ixx";

    // readStream.on('error', function(err) {
    //     console.log(err.stack);
    // });
    
    console.log("Running ixIxx to index the files.");
    const ixProcess = spawn('cat | ./ixIxx /dev/stdin', [ixFileName, ixxFileName], { shell: true });

    // Pass the readStream as stdin into ixProcess.
    readStream.pipe(ixProcess.stdin);
    readStream2.pipe(ixProcess.stdin);

    // HERE !!!

    // End the ixProcess stdin when the stream is done.
    readStream.on('end', () => {
        ixProcess.stdin.end();
        console.log(`Done! Check ${ixFileName} and ${ixxFileName} files for output.`);
    });

    ixProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ixProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ixProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
