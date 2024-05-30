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

const openProxiesFile = async (fileName = 'proxies') => {
  const proxyTxt = await loadTextFile(`./src/assets/proxies/${fileName}.txt`)
  let arr = proxyTxt.split('\n')

  return arr[(Math.floor(Math.random() * arr.length))]
}

const cleanText = (text) => {
  text = text.trim();

  text = text.replace(/^'|',?$/g, '');
  return text;
}
  
export const getRandomProxy = async (fileName) => {
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

export const downloadProxies = async () => {
    await download(process.env.PROXY_URL, './src/assets/proxies/proxies.txt')
}

export const scrollDown = async (page) => {
  await page.evaluate(() => {
    const scrollStep = 160; // Adjust the scrolling step as needed
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
    }, 5000);
  });
}

export const scrollToRandomClass = async (page, elementClass, browser) => {
  try {
    await addRandomTimeGap(2, 2);
    const products = await page.$$(elementClass);
    const randomIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomIndex];

    await page.evaluate((element) => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, randomProduct);
  }catch(error){
    browser.close();
  }
};

export const findAndScrollToAnchorByHrefContent = async (page, searchText, browser) => {
  try {
      // Using page.$$eval to evaluate the code in the context of the browser page
      const firstClick = searchText;
      await page.$$eval('a', (links, firstClick) => {
          for (const link of links) {
              if (link.href.includes(firstClick)) {
                  link.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
                  link.click();
                  break;  // Assuming you want to click the first matching link
              }
          }
      }, firstClick);

      await addRandomTimeGap(3, 7);
  } catch (error) {
    console.log(error);
    await browser.close();
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
      await browser.close();
    }
  } else {
    await browser.close();
  }
}

export const scrollToElementAndClickIt = async (page, classElement, delayInMilliseconds = 2000) => {
  await page.waitForSelector(classElement); // Wait for the element to be present

  await page.evaluate(async (text, delay) => {
    const favoriteButton = document.querySelector(text);
    if (favoriteButton) {
      favoriteButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      await new Promise(resolve => setTimeout(resolve, delay));

      favoriteButton.click();
    }
  }, classElement, delayInMilliseconds);
};

export const getRandomScreenSize = () => {
  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
  ];

  const randomIndex = Math.floor(Math.random() * resolutions.length);
  return resolutions[randomIndex];
}

export const autoScrollAllImages = async(page, numberOfImagesToScroll) => {
  const images = await page.$$('img');

  if (images.length === 0) {
    console.error('No images found on the page.');
    return;
  }

  for (let i = 0; i < Math.min(numberOfImagesToScroll, images.length); i++) {
    const image = images[i];

    await image.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    await page.waitForTimeout(1000);
  }
}

export const selectOptionById = async(page, dropdownId, optionValue) =>{
  await page.waitForSelector('#sort');
  await addRandomTimeGap(3, 7);
  await page.click('#sort');
  await addRandomTimeGap(3, 7);
  await page.select(`#${dropdownId}`, optionValue);
}

export const getRandomStartingUrl = (urls = []) =>{
  try {
    const defaultUrl = [      
      'https://www.bol.com/nl/nl/m/klantenservice/',
    ]
    const links = urls.length ? urls.length : defaultUrl
  
    return links[generateNumberBetween(0, links.length - 1)];
  }catch(error) {
    return 'https://www.bol.com/nl/nl/m/klantenservice/'
  }
}

export const getSearchTextFromURL = (url) => {
  try {
      // Create a URL object
      const parsedUrl = new URL(url);

      // Get the value of the 'searchtext' parameter
      const searchText = parsedUrl.searchParams.get('searchtext');

      return searchText;
  } catch (error) {
      return null; // Return null if an error occurs
  }
}

export const ensureSelectorExists = async (page, selector, timeout = 5000, maxRetries = 5) => {
  let retries = 0;
  while (retries < maxRetries) {
      try {
          await page.waitForSelector(selector, { timeout });
          return true; // Selector found
      } catch (error) {
          retries++;
          console.log(`Attempt ${retries} failed: Selector ${selector} not found. Reloading the page...`);
          try {
              await page.reload();
              await booster.addRandomTimeGap(10, 15); // Add random time gap after reload
              await booster.scrollDown(page); // Scroll down again after reload
          } catch (reloadError) {
              console.log(`Failed to reload the page on attempt ${retries}: ${reloadError.message}`);
              return false; // Return false if reload fails
          }
      }
  }
  console.log(`Failed to find selector ${selector} after ${maxRetries} attempts`);
  return false; // Return false if the selector is not found after max retries
}




