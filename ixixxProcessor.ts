import child = require('child_process');

export function runIxIxx(){
    const inputFilePath: string = "./test/test2/input.txt";
    const ixFileName: string = "out.ix";
    const ixxFileName: string = "out.ixx";
    const ls = child.spawn('./ixIxx', [inputFilePath, ixFileName, ixxFileName]);

    ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    });
}
