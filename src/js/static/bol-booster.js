import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'

const initBooster = async (product, threadTimer = 300, steps) => {
  
  // Set stealth plugin
  const stealthPlugin = StealthPlugin();
  puppeteer.use(stealthPlugin);

  // Set a timer to close the browser and the method after the specified duration
  let browser = null;

  setTimeout(async () => {
    if (browser) {
      console.log(`Browser closed after ${threadTimer} seconds.`);
      await browser.close();
    }
  }, threadTimer * 1000);

  // Parameters
  let link = null;
  let keyword = null;

  if(steps == 'homepage') {
    link = 'https://www.bol.com/'
    keyword = booster.getRandomKeyword(product.keywords) 
  }else {
    link = booster.getRandomKeyword(product.keywordLink) 
  }

  const productId =  product.productId
  const proxy = await booster.getRandomProxy('proxies-nl')

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
    
  // initialize booster page

  try {
    browser = await puppeteer.launch({ 
      headless: false,
      args: [
        `--proxy-server=${proxy}`,
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--single-process',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-sandbox',
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
  let url = null;

  try {
    page = await browser.newPage();
    await page.setUserAgent(userAgentStr);
    await page.setViewport({ width: screenSize.width, height: screenSize.height, isMobile: false, isLandscape: true, hasTouch: false, deviceScaleFactor: 1 });
  }catch(error) {
    return;
  } 

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    await browser.close()
  }

  // Intercept requests
  if(page) {
    try {
      url = await page.url();
      content = await page.content();
    }catch(error) {
      return;
    }
  }else {
    return;
  }

  if(content) {
    try {
    
      /* log session information */
      
      // console.log(`proxy: ${proxy}`)
      // console.log(`user-agent: ${userAgentStr}`)

      await booster.addRandomTimeGap(3, 6);

      // Step 1: Click Accept Terms button on init
      const acceptTermsButton = '#js-first-screen-accept-all-button';
      await page.waitForSelector(acceptTermsButton);
      await page.click(acceptTermsButton);
      await booster.addRandomTimeGap(3, 6);

      // Step 2: Click Accept Terms button on init
      const countryButton = '.js-country-language-btn';
      await page.waitForSelector(countryButton);
      await page.click(countryButton);

      await booster.addRandomTimeGap(3, 6);
      await booster.scrollDown(page);
      await booster.addRandomTimeGap(3, 6);

      if(steps == 'homepage') {
          // Scroll to the element
          await page.evaluate(() => {
            const element = document.querySelector('.js-search-input');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
          });

          // Step 3: Type into search box.
          await booster.addRandomTimeGap(3, 6);
          await page.type('.js-search-input', keyword, {delay: 300});

          // Step 4: Search Product
          await booster.addRandomTimeGap(3, 7);
          await page.keyboard.press('Enter');
          await booster.addRandomTimeGap(3, 7);
      }

      for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
        await booster.scrollToRandomClass(page, '.list_page_product_tracking_target');
      }

      // Step 5: Go to product page
      await booster.addRandomTimeGap(3, 7);
      const searchText = productId;
      await booster.findAndScrollToAnchorByHrefContent(page, searchText, browser);

      await booster.addRandomTimeGap(3, 7);
      for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
        await booster.scrollToRandomClass(page, '.product-item__content', browser);
      }

      // Step 6: Add to wishlist

      try {
        // Click the element
        await page.click(`[global-id="${productId}"]`);
        await booster.addRandomTimeGap(3, 7);
        await page.click('.modal__window--close-hitarea');
        await booster.addRandomTimeGap(3,7);
        await page.click(`.ui-btn--buy`);
      }catch (error) {
        if(browser) {
          await browser.close();
        }

        return;
      } 

      
      await booster.addRandomTimeGap(10, 10);

    }catch(error) {
      await browser.close();
    }
  }

  await browser.close();
}

export const triggerBolBooster = async (thread, product) => {

  await booster.addRandomTimeGap(3)

  for (let index = 1; index <= thread; index++) {
    try {

      let productThreads = 4;
      let currentBatch = [];

      for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
        currentBatch.push(initBooster(product));
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

export const triggerAllBolBooster = async (thread, currentVM, steps = 'homepage') => {

  await booster.addRandomTimeGap(1, 3)

  const productJsonFile = await dynamicallyImportJsonFile( currentVM + '.json');
  const products = productJsonFile.products.filter( item => !item.isOutOfStock);

  console.log(products.length);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {

    console.log('current thread:' + mainIndex);
    try {
      for (let index = 0; index < products.length; index++) {

        let productThreads = 4;
        let currentBatch = [];

        for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
          await booster.addRandomTimeGap(2, 2);
          currentBatch.push(initBooster(products[index], 300, steps));
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
          return;
        }

      }
    }catch (error) {
      if(!process.env.TURN_OFF_LOGS) {
        console.error(error);
      }

      return;
    }
  }
};

