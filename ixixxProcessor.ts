import child = require('child_process');

export function helloWorld(){
    const inputFilePath: string = "./test/test1/input.txt"
    const ls = child.spawn('./ixIxx', [inputFilePath, "out.ix", "out.ixx"]);

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
