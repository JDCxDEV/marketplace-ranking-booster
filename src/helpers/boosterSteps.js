import 'dotenv/config';
import { loadTextFile } from 'load-text-file'
import { download } from './server.js';

export const generateNumberBetween = (min = 5, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const addTimeGap = async (msec = 5000) => {
  await new Promise(resolve => {
      setTimeout(() => {
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
  const proxyTxt = await loadTextFile('./src/assets/proxies/proxies.txt')
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
    await download(process.env.PROXY_URL, './src/assets/proxies/proxies.txt')
}

export const scrollDown = async (page) => {
  await page.evaluate(() => {
    const scrollStep = 50; // Adjust the scrolling step as needed
    const scrollInterval = 100; // Adjust the scrolling interval (ms) as needed

    function smoothScroll() {
      let scrollFrom = window.scrollY;
      let scrollTo = scrollFrom + scrollStep;
      if (scrollTo >= document.body.scrollHeight) {
        scrollTo = 0;
      }

      window.scroll({
        top: scrollTo,
        behavior: 'smooth',
      });
    }

    const scrollIntervalId = setInterval(smoothScroll, scrollInterval);

    setTimeout(() => {
      clearInterval(scrollIntervalId);
    }, 4000);
  });
}

export const scrollToRandomClass = async (page, elementClass, browser) => {
  try {
    await addRandomTimeGap(3, 7);
    const products = await page.$$(elementClass);
    const randomIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomIndex];

    await page.evaluate((element) => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, randomProduct);
  }catch(error){
    return;
  }
};

export const findAndScrollToAnchorByText = async (page, searchText, browser) => {
  const link = await page.evaluate((text) => {
      const anchors = Array.from(document.querySelectorAll('a')); // Change the selector if necessary
      const foundAnchor = anchors.find(anchor => anchor.textContent.includes(text));
  
      return foundAnchor ? foundAnchor.href : null;
    }, searchText);
  
    if (link) {
      await addRandomTimeGap(3, 7);
      const foundElement = await page.$x(`//a[contains(text(), "${searchText}")]`);
      if (foundElement.length > 0) {

        await foundElement[0].click();
      } else {
        return browser.close();
      }
    } else {
      return browser.close();
    }
}


export const scrollToElementAndClickIt = async (page, classElement) => {
  await page.evaluate((text) => {
    const favoriteButton = document.querySelector(text);
    if (favoriteButton) {
      favoriteButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      favoriteButton.click();
    }
  }, classElement);
}


