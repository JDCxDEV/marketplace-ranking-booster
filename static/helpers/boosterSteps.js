import { loadTextFile } from 'load-text-file'
import 'dotenv/config';
import { download } from './server.js';

export const generateNumberBetween = (min = 5, max = 10) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const addTimeGap = async (msec = 5000) => {
    await new Promise(resolve => {
        setTimeout(() => {
        /* hang on define milliseconds; count */
        resolve()
        }, msec)
    });
}
  
export const addRandomTimeGap = async (min = 5, max = 10) => {
    await addTimeGap(generateNumberBetween(min, max) * 1000)
}

export const getRandomKeyword = (keywords) => {
    return keywords[(Math.floor(Math.random() * keywords.length))]
}
  
export const isForbiddenPage = (request) =>{
    const response = request.response();

    if (response) {
        const statusCode = response.status();
        if (statusCode === 403) {
            console.log(`Forbidden page request (403): ${request.url()}`);
            return true;
        } else if (statusCode === 404) {
            console.log(`Not Found page request (404): ${request.url()}`);
            return true;
        } else if (statusCode === 500) {
            console.log(`Internal Server Error page request (500): ${request.url()}`);
            return true;
        }
    }
    return false;
}

const openProxiesFile = async () => {
    const proxyTxt = await loadTextFile('./proxies/proxies.txt')
    let arr = proxyTxt.split('\n')

    return arr[(Math.floor(Math.random() * arr.length))]
}
  
export const getRandomProxy = async () => {
    let proxies = null;

    while(proxies == null) {
        try {
            proxies = await openProxiesFile();
        }catch ($error) {
            console.log('error on opening the proxies files');
        }
    }

    return proxies
}

export const downloadProxies = async () => {
    await download(process.env.PROXY_URL, './proxies/proxies.txt')
}