import fs from 'fs';
import https from 'https';

export const download = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: 'wx' });

    try {
        fs.rmSync(dest, { force: true });
    } catch (err) {
        // Ignore errors if file doesn't exist
    }

    const request = https.get(url, response => {
        if (response.statusCode === 200) {
            response.pipe(file);
        } else {
            cleanup(file, dest, `Server responded with ${response.statusCode}: ${response.statusMessage}`);
            reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
        }
    });

    request.on('error', err => {
        cleanup(file, dest, err.message);
        reject(err.message);
    });

    file.on('finish', () => resolve());

    file.on('error', err => {
        cleanup(file, dest, err.code === 'EEXIST' ? 'File already exists' : err.message);
        if (err.code !== 'EEXIST') {
            reject(err.message);
        }
    });
});

const cleanup = (file, dest, errorMessage) => {
    file.close();
    fs.unlink(dest, () => {}); 
    console.error(errorMessage);
};