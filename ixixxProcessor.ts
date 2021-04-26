import child = require('child_process');
import { ReadStream}  from 'fs';
import { read } from 'node:fs';

export function runIxIxx(readStream: ReadStream){
    const ixFileName: string = "out.ix";
    const ixxFileName: string = "out.ixx";

    // readStream.on('error', function(err) {
    //     console.log(err.stack);
    // });
    
    const ixProcess = child.spawn('cat | ./ixIxx /dev/stdin', [ixFileName, ixxFileName], { shell: true });
    
    // TODO: Sanitize the readStream because we are passing to the shell.
    // Pass the readStream as stdin into ixProcess.
    readStream.pipe(ixProcess.stdin);

    // End the ixProcess stdin when the stream is done.
    readStream.on('end', (data) => {
        ixProcess.stdin.end();
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

    console.log(`Done! Check ${ixFileName} and ${ixxFileName} files for output.`);
}
