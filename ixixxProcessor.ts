import child = require('child_process');
import fs = require('fs');

export function runIxIxx(){
    const inputFilePath: string = "./test/test1/input.txt";
    const ixFileName: string = "out.ix";
    const ixxFileName: string = "out.ixx";

    // For now just read in the input file to readStream for testing.
    const readStream = fs.createReadStream(inputFilePath);

    // // Handle stream events --> data, end, and error
    // readStream.on('data', function(chunk) {
    //     console.log(data);
    // });
    
    // readStream.on('end',function() {
    //     console.log(data);
    // });
    
    // readStream.on('error', function(err) {
    //     console.log(err.stack);
    // });
    

    const ixProcess = child.spawn('cat | ./ixIxx /dev/stdin $1 $2', [ixFileName, ixxFileName], { shell: true });
    // Pass the readStream as stdin into ixProcess.
    readStream.pipe(ixProcess.stdin);

    ixProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ixProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ixProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    console.log("Done!");
}
