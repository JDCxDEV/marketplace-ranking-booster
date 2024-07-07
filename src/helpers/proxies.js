import 'dotenv/config';
import { loadTextFile } from 'load-text-file'

const cleanText = (text) => {
    text = text.trim();
  
    text = text.replace(/^'|',?$/g, '');
    return text;
  }

const openProxiesFile = async (fileName = 'proxies') => {
    const proxyTxt = await loadTextFile(`./src/assets/proxies/${fileName}.txt`)
    let arr = proxyTxt.split('\n')
  
    return arr[(Math.floor(Math.random() * arr.length))]
}
    
const getRandomProxy = async (fileName) => {
      let proxies = null;
  
      while(proxies == null) {
          try {
              proxies = await openProxiesFile(fileName);
          }catch ($error) {
              console.log('error on opening the proxies files');
          }
      }
  
      return cleanText(proxies)
  }

const proxiesCredentials = [
    {   
        id: 'smart-proxy-nl',
        name: 'smart proxy nl',
        host: 'https://dc.smartproxy.com:10000',
        username: 'sp54szgndr',
        password: 'y6p7gahxuATr2SBp4_'
    },
    {
        id: 'ip-royal-nl',
        name: 'ip royal',
        host: await getRandomProxy('ip-royal-nl'),
        username: '14a196fbcf0c4',
        password: '101d7b8992'
    },
    {
        id: 'smart-proxy-de',
        name: 'smart proxy de',
        host: 'https://dc.smartproxy.com:10000',
        username: 'spjqq82as8',
        password: 'zVzqSe5i8mBR71wt+m'
    },
];

const getProxiesCredential = (proxyList, proxyId) => {
    try {
        const matchingObjects = proxyList.filter(obj => obj.id === proxyId);

        return matchingObjects.length > 0 ? matchingObjects[0] : null;
    } catch (error) {
        console.error("Error occurred while filtering objects:", error);
        return null;
    }
}

export const getAssignedProxies = (proxyId = null) => {
    try {
        // Create a URL object
        const proxyCredential = getProxiesCredential(proxiesCredentials, proxyId);
   
        return proxyCredential;
    } catch (error) {
        return null; // Return null if an error occurs
    }
}
  
