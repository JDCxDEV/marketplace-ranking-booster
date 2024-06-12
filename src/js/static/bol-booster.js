import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'
import * as proxies from '../../helpers/proxies.js';

const initBooster = async (product, threadTimer = 360, steps, proxyProvider) => {
  
  // Set stealth plugin
  const stealthPlugin = StealthPlugin();
  puppeteer.use(stealthPlugin);

  // Set a timer to close the browser and the method after the specified duration
  let browser = null;

  setTimeout(async () => {
    if (browser) {
      // console.log(`Browser closed after ${threadTimer} seconds.`);
      await browser.close();
    }

    return;
  }, threadTimer * 1000);

  // Parameters
  let link = null;
  let keyword = null;

  if(steps == 'homepage') {
    link = booster.getRandomStartingUrl()
    keyword = booster.getRandomKeyword(product.keywords) 
  }else {
    if(product.keywordLink.length) {
      link = booster.getRandomKeyword(product.keywordLink) 
    }else {
      return;
    }
  }

  const productId = product.productId
  const proxy = await proxies.getAssignedProxies(proxyProvider)

  // Create random user-agent to be set through plugin
  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
  const userAgentStr = userAgent.toString();
  const screenSize = booster.getRandomScreenSize();

  // Use the anonymize user agent plugin with custom user agent string
  await puppeteer.use(pluginAnonymizeUA({
    customFn: () => userAgentStr,
    stripHeadless: true,
    makeWindows: false,
  }));
    
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      args: [
        `--proxy-server=${proxy.host}`,
        '--window-position=0,0',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--start-maximized'
        ],
  
        ignoreDefaultArgs: ['--enable-automation'], // Exclude arguments that enable automation
    });
  }catch(error) {
    return;
  }

  let page = null;
  let content = null;
  
  const username = proxy.username;
  const password = proxy.password;

  try {
    page = await browser.newPage();
    
    await page.authenticate({
      username,
      password,
    });

    await page.setUserAgent(userAgentStr);
    await page.setViewport({ width: screenSize.width, height: screenSize.height, isMobile: false, isLandscape: true, hasTouch: false, deviceScaleFactor: 1 });
  }catch(error) {
    if(browser) {
      await browser.close();
    }

    // console.log(error.message);
    return;
  } 

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    // console.log(error);

    if(browser) {
      await browser.close();
    }

    return;
  }

  if(page) {
    try {
      content = await page.content();
    }catch(error) {
      console.log(error.message);
      return;
    }
  }else {
    if(browser) {
      await browser.close();
    }
    return;
  }

  if(content) {
    try {
    
      /* log session information */
      
      // console.log(`proxy: ${proxy}`)
      // console.log(`user-agent: ${userAgentStr}`)

      await booster.addRandomTimeGap(7, 10);

      // Step: Click Accept Terms button on init
      const acceptTermsButton = '#js-first-screen-accept-all-button';
      await page.waitForSelector(acceptTermsButton);
      await page.click(acceptTermsButton);

      await booster.addRandomTimeGap(5, 5);

      // Step: Click Accept Terms button on init
      const countryButton = '.js-country-language-btn';
      await page.waitForSelector(countryButton);
      await page.click(countryButton);

      await booster.addRandomTimeGap(5, 10);

      const minSequenceLength = 5;
      const maxSequenceLength = 10;
      
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
      const executeScrollSequence = async (page) => {
        const scrollSequence = generateScrollSequence();
      
        for (const direction of scrollSequence) {
          if (direction === 'up') {
            await booster.scrollUp(page);
          } else {
            await booster.scrollDown(page);
          }
        }
      }
      
      // Execute the scroll sequence
      await executeScrollSequence(page);

      for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
        await booster.scrollToRandomClass(page, '.list_page_product_tracking_target', browser);
      }

      let addedToWishlist = false;

      await booster.addRandomTimeGap(5, 5);

      if(steps == 'homepage') {
          // Scroll to the element
          await page.evaluate(() => {
            const element = document.querySelector('.js-search-input');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
          });

          // Step: Type into search box.
          await booster.addRandomTimeGap(3, 6);
          await page.type('.js-search-input', keyword, {delay: 300});

          // Step: Search Product

          try {
            await booster.addRandomTimeGap(3, 7);
            await page.keyboard.press('Enter');
            await booster.addRandomTimeGap(10, 12);
            await page.keyboard.press('Enter');
            await booster.addRandomTimeGap(10, 12);
     
          }catch (error) {
            console.log(error.message);
          }
      }

      for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
        await booster.scrollToRandomClass(page, '.list_page_product_tracking_target', browser);
      }

      

      // Step: Go to product page
      
      try {
        await booster.addRandomTimeGap(5, 5);

        const selector = `[data-config='{"product_id": "${productId}"}']`;

        // Wait for the element to be present in the DOM
        await page.waitForSelector(selector, {timeout: 10000});
      
        // Click the element
        await page.click(selector);

      }catch(error) {
        if(browser) {
          await browser.close();
        }

        return;
      }

      await booster.addRandomTimeGap(5, 10);

      // hover new to the image
      try {
        const elementSelector = 'wsp-selected-item-image-zoom-modal-application';
      
        await page.waitForSelector(elementSelector, { timeout: 10000 });
      
        await booster.addRandomTimeGap(5, 7);
      
        // Hover over the custom element
        await page.hover(elementSelector);
      
        // Add a random time gap after hovering (if needed)
        await booster.addRandomTimeGap(3, 5);
      } catch (error) {
        // continue if caught error
      }

      try {
        await booster.addRandomTimeGap(3, 5);

        const carouselClicked = `[data-test="carousel-next"]`;

        // Wait for the element to be present in the DOM
        await page.waitForSelector(carouselClicked, {timeout: 10000});
      
        // Click the element
        await page.click(carouselClicked);

      }catch(error) {
        // continue if get error
      }

      try {
        const showMore = `//*[@data-test="show-more"]`;

        // Wait for the XPath selector with a timeout of 10 seconds (adjust as needed)
        await page.waitForXPath(showMore, { timeout: 10000 });

        // Find the element using XPath
        const [showMoreElement] = await page.$x(showMore);

        if (showMoreElement) {
          // Add a random time gap before clicking
          await booster.addRandomTimeGap(5, 7);
          await showMoreElement.hover();
          // Click the element
          await showMoreElement.click();

          await booster.addRandomTimeGap(5, 7);
        

          success = true; // Set success to true if click is successful
        }
      } catch (error) {
        // continue
      }


      await booster.scrollDown(page);

      try { 
        await page.waitForSelector('.product-item__content');

        for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
          await booster.scrollToRandomClass(page, '.product-item__content', browser);
        }
      }catch(error) {
        // continue if get error
      }

      // Step: Add to wishlist & Add to cart
      if(!addedToWishlist) {
        const maxRetries = 5;
        let attempts = 0;
        let success = false;

        while (attempts < maxRetries && !success) {
          try {
            const xpath = `//*[@global-id='${productId}']`;

            // Wait for the XPath selector with a timeout of 10 seconds (adjust as needed)
            await page.waitForXPath(xpath, { timeout: 10000 });

            // Find the element using XPath
            const [element] = await page.$x(xpath);

            if (element) {
              // Add a random time gap before clicking
              await booster.addRandomTimeGap(5, 7);

              // Click the element
              await element.click();
              console.log('Element clicked');

              await booster.addRandomTimeGap(5, 7);
              
              // Wait for and click the modal close button
              await page.waitForSelector('.modal__window--close-hitarea', { timeout: 10000 });
              await page.click('.modal__window--close-hitarea');

              // Add a random time gap after clicking (if needed)
              await booster.addRandomTimeGap(3, 5);

              success = true; // Set success to true if click is successful
            } else {
              console.log('Element not found');
            }
          } catch (error) {
            // continue
          }

          attempts++;
          
          // Wait before the next attempt (optional, for better pacing)
          if (!success) {
            await booster.addRandomTimeGap(3, 5);
          }
        }

        if (!success) {
          console.log(`Failed to click the element after ${maxRetries} attempts.`);
        }
      }
      
      await booster.addRandomTimeGap(3, 3);

    }catch(error) {
      console.log(error.message);
      if(browser) {
        await browser.close();
      }
    }
  }

  await browser.close();
}

export const triggerBolBooster = async (thread, product, steps = 'homepage') => {

  await booster.addRandomTimeGap(3)

  for (let index = 1; index <= thread; index++) {
    try {

      let productThreads = 5;
      let currentBatch = [];

      for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {

        currentBatch.push(initBooster(product, 300, product.isPerPage ? 'per-page' : steps));
      }   
    
      const timeoutMilliseconds = 300000; // 5 minutes

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout exceeded'));
        }, timeoutMilliseconds);
      });
      
      try {
        await Promise.race([
          Promise.all(currentBatch),
          timeoutPromise
        ]).then(() => {
          console.log('current thread:' + index + ' completed');
        }).catch(error => {
          console.error('Error:', error.message);
        });
      }catch(error) {
        return;
      }


    }catch (error) {
      if(!process.env.TURN_OFF_LOGS) {
        console.error(error);
      }
    }
  }
};


const dynamicallyImportJsonFile = async (file)  => {
  const { default: jsonObject } = await import(`./../../assets/json/bol/${file}`, {
      assert: {
        type: 'json'
      }
  });

  return jsonObject
}

export const triggerAllBolBooster = async (thread, currentVM, virtualMachine = {}) => {

  await booster.addRandomTimeGap(2, 2)

  const productJsonFile = await dynamicallyImportJsonFile(currentVM + '.json');
  const products = productJsonFile.products.filter( item => !item.isOutOfStock);

  console.log(products.length);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {

    console.log('current thread:' + mainIndex);
    try {
      for (let index = 0; index < products.length; index++) {

        let productThreads = 5;
        let currentBatch = [];

        for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
          await booster.addRandomTimeGap(3, 3);
          currentBatch.push(initBooster(products[index], 300, products[index].isPerPage ? 'per-page' : virtualMachine.steps, virtualMachine.proxy));
        }   
      
        const timeoutMilliseconds = 300000; // 5 minutes

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Timeout exceeded'));
          }, timeoutMilliseconds);
        });
        
        try {
          await Promise.race([
            Promise.all(currentBatch),
            timeoutPromise
          ]).then(() => {
            console.log('current thread:' + mainIndex + ' completed');
          }).catch(error => {
            console.error('Error:', error.message);
          });
        }catch(error) {
          console.log(error.message)
          return;
        }

      }
    }catch (error) {
      console.log(error.message)
      if(!process.env.TURN_OFF_LOGS) {
        console.error(error);
      }

      return;
    }
  }
};

