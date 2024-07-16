import 'dotenv/config';
import { loadTextFile } from 'load-text-file'
import { download } from './server.js';
import  *  as random from './random.js'

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

export const scrollDown = async (page,) => {
  await page.evaluate(() => {
    const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const scrollStep = getRandom(160, 200); // Randomize the scrolling step between 160 and 200
    const scrollInterval = getRandom(100, 300); // Randomize the scrolling interval (ms) between 100 and 300

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

export const scrollUp = async (page) => {
  await page.evaluate(() => {
    const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const scrollStep = getRandom(160, 200); // Randomize the scrolling step between 160 and 200
    const scrollInterval = getRandom(100, 300); // Randomize the scrolling interval (ms) between 100 and 300

    function smoothScrollUp() {
      let scrollFrom = window.scrollY;
      let scrollTo = scrollFrom - scrollStep; // Scroll up by subtracting the scroll step
      if (scrollTo <= 0) {
        scrollTo = document.body.scrollHeight; // Scroll to the bottom if already at the top
      }

      window.scroll({
        top: scrollTo,
        behavior: 'smooth',
      });
    }

    const scrollIntervalId = setInterval(smoothScrollUp, scrollInterval);

    setTimeout(() => {
      clearInterval(scrollIntervalId);
    }, 4000);
  });

  // Optionally add a random delay to simulate human-like behavior
  await addRandomTimeGap(3, 6);
}

export const scrollToRandomClass = async (page, elementClass, browser = null, uniqueSelector = null) => {
  try {
    await addRandomTimeGap(2, 3);
    const products = await page.$$(elementClass);
    const randomIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomIndex];

    await page.evaluate(async (element) => {
      function getRandomDelay(min, max) {
        return Math.random() * (max - min) + min;
      }
    
      function scrollToElement(element) {
        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY || window.pageYOffset;
    
        // Calculate scroll amount to bring the element to the center of the viewport
        const scrollTarget = elementRect.top + scrollY - (viewportHeight / 2) + (elementRect.height / 2);
    
        // Smooth scroll by manually animating over time
        const duration = getRandomDelay(1000, 2000); // Adjust as needed for smoother or slower animation
        const start = performance.now();
        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
        function scrollStep(timestamp) {
          const elapsed = timestamp - start;
          window.scrollTo(0, scrollY + (scrollTarget - scrollY) * easeInOutQuad(Math.min(elapsed / duration, 1)));
    
          if (elapsed < duration) {
            requestAnimationFrame(scrollStep);
          }
        }
    
        requestAnimationFrame(scrollStep);
      }
    
      scrollToElement(element);
    
      await new Promise((resolve) => {
        setTimeout(resolve, getRandomDelay(800, 1500)); // Random delay between 800ms and 1500ms
      });
    }, randomProduct);

    await addRandomTimeGap(2, 3);

    if(uniqueSelector === 'bol') {
      try {
        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
        const randomizeSelector = (index) => {
          const selectors = [
            `li:nth-of-type(${index}) wsp-analytics-tracking-event span`,
            `li:nth-of-type(${index}) > button`,
            `li:nth-of-type(${index}) [data-test='compare-checkbox'] div > div`
          ];
          const selectorIndex = getRandomInt(0, selectors.length - 1);
          return selectors[selectorIndex];
        };
      
        // Repeat the try-catch block 1 to 3 times
        const repeatTimes = random.determineRepeatTimes(products.length);
        
        if(repeatTimes) {
          for (let i = 0; i < repeatTimes; i++) {
            await addRandomTimeGap(2, 3);
            try {
              if (uniqueSelector === 'bol') {
                const randomIndex = getRandomInt(1, 10); // Adjust the range as needed
                const selectedProduct = randomizeSelector(randomIndex);
        
                await page.waitForSelector(selectedProduct, { timeout: 10000 });
                await page.hover(selectedProduct);
  
                const getRandomBoolean = () => Math.random() < 0.5;
  
                if (selectedProduct === `li:nth-of-type(${randomIndex}) [data-test='compare-checkbox'] div > div`) {
                    // Get a random boolean value for 50/50 chance
                    const shouldClick = getRandomBoolean();
  
                    // If the random value is true, click the element
                    if (shouldClick) {
                      await page.click(selectedProduct);
                    }
                }
              }
            } catch (error) {
              return;
            }
          }
        }

      } catch (error) {
        // console.log(error.message);
        return;
      }
    }

  }catch(error){
    // console.log(error.message);
    return;
  }
};

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
    { width: 1920, height: 1080 },  // Full HD
    { width: 1366, height: 768 },   // HD
    { width: 1536, height: 864 },   // HD+
    { width: 1440, height: 900 },   // WXGA+
    { width: 1600, height: 900 },   // HD+
    { width: 1280, height: 720 },   // HD
    { width: 1280, height: 800 },   // WXGA
    { width: 1680, height: 1050 },  // WSXGA+
    { width: 1360, height: 768 },   // HD
    { width: 1920, height: 1200 },  // WUXGA
    { width: 1856, height: 1044 },  // Slightly below Full HD
    { width: 1792, height: 1008 },  // Slightly below Full HD
    { width: 1728, height: 972 },   // Slightly below Full HD
    { width: 1600, height: 960 },   // Slightly below Full HD
    { width: 1536, height: 960 },   // Slightly below Full HD
    { width: 1440, height: 960 },   // Slightly below Full HD
    { width: 1920, height: 1152 },  // Slightly above Full HD
    { width: 1980, height: 1080 },  // Slightly above Full HD
    { width: 1768, height: 992 },   // Slightly below Full HD
    { width: 1680, height: 945 },   // Slightly below Full HD
    { width: 1600, height: 900 },   // Slightly below Full HD
    { width: 1440, height: 810 },   // Slightly below Full HD
    { width: 1920, height: 1088 },  // Slightly above Full HD
    { width: 1980, height: 1100 },  // Slightly above Full HD
    { width: 1792, height: 1008 },  // Slightly below Full HD
    { width: 1728, height: 972 },   // Slightly below Full HD
    { width: 1600, height: 900 },   // Slightly below Full HD
    { width: 1536, height: 864 },   // Slightly below Full HD
    { width: 1440, height: 800 },   // Slightly below Full HD
    { width: 1920, height: 1200 },  // Slightly above Full HD
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

export const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const clickElement = async (page, browser, elementXPath, hoverDelay = 750, timeout = 30000) => {
  try {
    await page.waitForXPath(elementXPath, { timeout });
    const [element] = await page.$x(elementXPath);
    
    if (element) {
      await page.evaluate(el => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, element);
      await element.hover();
      await page.waitForTimeout(hoverDelay); // Adjust delay time as necessary
      await element.click();
    }

    return true;
  } catch (error) {

    if(browser) {
      browser.close();
    }
    
    return false;
  }
};

export const clickElementBySelector = async (page, browser, selector, hoverDelay = 750, timeout = 10000,) => {
  try {
    await page.waitForSelector(selector, { timeout: timeout });
    const element = await page.$(selector);

    if (element) {
      await page.waitForTimeout(3000); // Adjust delay time as necessary

      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.click();
        }
      }, selector);

      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const generateAndExecuteScrollSequence = async (page, minSequenceLength = 5, maxSequenceLength = 10) => {
  // Function to generate a random sequence of scroll directions
  const generateScrollSequence = () => {
    const sequenceLength = Math.floor(Math.random() * (maxSequenceLength - minSequenceLength + 1)) + minSequenceLength;
    const sequence = [];

    for (let i = 0; i < sequenceLength; i++) {
      const direction = Math.random() < 0.5 ? 'up' : 'down'; // Randomly choose between 'up' and 'down'
      sequence.push(direction);
    }

    return sequence;
  }

  // Function to execute the scroll sequence
  const executeScrollSequence = async (sequence) => {
    for (const direction of sequence) {
      if (direction === 'up') {
        await scrollUp(page);
      } else {
        await scrollDown(page);
      }
    }
  }

  const scrollSequence = generateScrollSequence();
  await executeScrollSequence(scrollSequence);
}

export const generateRandomSequence = (min, max) => {
  const sequence = [];
  for (let i = min; i <= max; i++) {
      sequence.push(i);
  }
  
  for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]]; 
  }

  return sequence;
}

export const scrollToSelector = async (page, xpath) => {
  try {
      await page.waitForXPath(xpath);

      const elementHandle = await page.$x(xpath);
      const boundingBox = await elementHandle[0].boundingBox();

      await page.evaluate((x, y) => {
          window.scrollTo(x, y);
      }, boundingBox.x, boundingBox.y);

      await page.waitForTimeout(1000); // Adjust delay time as needed
  } catch (error) {
    return null;
  }
};
