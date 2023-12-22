import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'
import { executablePath  } from 'puppeteer';

const initBooster = async (product) => {

  // Parameters
  const keyword = booster.getRandomKeyword(product.keywords) 
  const link = 'https://www.bol.com/'
  const productTitle =  product.productTitle
  const proxy = await booster.getRandomProxy()

  // Set stealth plugin
  const stealthPlugin = StealthPlugin();
  puppeteer.use(stealthPlugin);

  // Create random user-agent to be set through plugin
  const userAgent = new UserAgent();
  const userAgentStr = userAgent.toString();

  // Use the anonymize user agent plugin with custom user agent string
  await puppeteer.use(pluginAnonymizeUA({
    customFn: () => userAgentStr,
    stripHeadless: true,
    makeWindows: false,
  }));
    
  // initialize booster page
  const browser = await puppeteer.launch({ 
    headless: false,
    executablePath: executablePath(),
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
      ],

      ignoreDefaultArgs: ['--enable-automation'], // Exclude arguments that enable automation
  });
    
  const page = await browser.newPage();
  await page.setUserAgent(userAgentStr);
  await page.setViewport({ width: 1600, height: 1000, isMobile: false, isLandscape: true, hasTouch: false, deviceScaleFactor: 1 });

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    await browser.close()
  }

  const url = await page.url();
  const content = await page.content();

  // Intercept requests
  await page.setRequestInterception(true);

  await page.on('request', (request) => {
    // Continue with the request if it's not a forbidden page
    if (!booster.isForbiddenPage(request)) {
      request.continue();
    } else {
      browser.close();
    }
  });
    
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


        await booster.addRandomTimeGap(3, 7);
        
        // Step 4: Search Product
        await page.keyboard.press('Enter');
        await booster.addRandomTimeGap(3, 7);

        for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
            await booster.scrollToRandomClass(page, '.list_page_product_tracking_target');
        }

        await booster.addRandomTimeGap(3, 7);
        const searchText = productTitle;
        await booster.findAndScrollToAnchorByText(page, searchText, browser);


        await booster.addRandomTimeGap(3, 7);
        for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
            await booster.scrollToRandomClass(page, '.product-item__content', browser);
        }

        await booster.addRandomTimeGap(3, 7);
        await booster.scrollToElementAndClickIt(page, '.ui-btn--favorite')
       
        await booster.addRandomTimeGap(10, 10);

    }catch(error) {
      return await browser.close();
    }
  }

  await browser.close();
}

export const triggerBolBooster = async (thread, product) => {

  await booster.addRandomTimeGap(3)

  for (let index = 1; index <= thread; index++) {
    try {
      await initBooster(product) 
    }catch (error) {
      await booster.downloadProxies(product)

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

export const triggerAllBolBooster = async (thread, currentVM) => {

  await booster.addRandomTimeGap(3)

  const productJsonFile = await dynamicallyImportJsonFile( currentVM + '.json');
  const products = productJsonFile.products.filter( item => !item.isOutOfStock);

  console.log(products.length);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {

    console.log('current thread:' + mainIndex);
    try {
      for (let index = 0; index < products.length; index++) {
        await booster.addRandomTimeGap(3);

        let productThreads = 5;
        let currentBatch = [];

        for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
          currentBatch.push(initBooster(products[index]));
        }   
      
        const timeoutMilliseconds = 300000; // 5 minutes

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Timeout exceeded'));
          }, timeoutMilliseconds);
        });
        
        await Promise.race([
          Promise.all(currentBatch),
          timeoutPromise
        ]).then(() => {
          console.log('current thread:' + mainIndex + ' completed');
        }).catch(error => {
          console.error('Error:', error.message);
        });

      }
    }catch (error) {
      if(!process.env.TURN_OFF_LOGS) {
        console.error(error);
      }
    }
  }
};

