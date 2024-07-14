import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth-fix';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'
import * as proxies from '../../helpers/proxies.js';
import * as action from './actions/bol.js'
import * as array from '../../helpers/array.js'

const initBooster = async (product, threadTimer = 300, steps, proxyProvider) => {
  
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
        '--start-maximized',
        ],
  
        ignoreDefaultArgs: ['--enable-automation'], // Exclude arguments that enable automation
    });
  }catch(error) {
    return;
  }

  let page = null;
  let content = null;
  
  try {
    const username = proxy.username;
    const password = proxy.password;

    page = await browser.newPage();
    
    await page.authenticate({
      username,
      password,
    });

    await page.setUserAgent(userAgentStr);

    await page.setViewport(
      { 
        width: screenSize.width,
        height: screenSize.height,
        isMobile: false,
        isLandscape: true,
        hasTouch: false,
        deviceScaleFactor: 1 
      }
    );
  }catch(error) {
    if(browser) {
      await browser.close();
    }
    return;
  } 

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    // console.log(error.message)
    if(browser) {
      await browser.close();
    }

    return;
  }

  if(page) {
    try {
      content = await page.content();
    }catch(error) {
      // console.log(error.message);
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

      await booster.addRandomTimeGap(6, 8)

      // Step: Click Accept Terms button on init
      await action.clickPrivacyAndCountryButton(page, browser);
      // ----------- end of step ----------- //

      await booster.addRandomTimeGap(4, 5);

      // // Step: Click Accept Terms button on init
      // await action.clickProductListChangeView(page, browser);

      // await booster.addRandomTimeGap(4, 6);
      
      // // Step: Add random scroll 
      await booster.generateAndExecuteScrollSequence(page, 2, 3);
      // // ----------- end of step ----------- //
      
      await booster.addRandomTimeGap(3, 4);

      // Step: Click Accept Terms button on init
      await action.browseProducts(page, browser);
      // // ----------- end of step ----------- //

      await booster.addRandomTimeGap(3, 4);

     const addedToWishlist = await action.clickToWishList(page, browser, productId);

      await booster.addRandomTimeGap(3, 4);

      //Step: Go to the designated product
      const didGoToProduct = await action.clickCurrentProduct(page, browser, productId);

      if(!didGoToProduct) {
        if(browser) {
          await browser.close();
        }
      }

      // Step: Randomize hover and click
      await booster.addRandomTimeGap(8, 10);

      await action.addToWishList(page, browser, productId, addedToWishlist)


      await booster.addRandomTimeGap(3, 4);

      try {
        // Define the actions as an array of functions
        const actions = [
          async () => await action.hoverUpsaleText(page, browser),
          async () => await booster.generateAndExecuteScrollSequence(page, 2, 4),
          async () => await action.browseProductImage(page, browser),
          async () => await action.clickShowMoreDescription(page, browser),
          async () => await action.clickShowMoreMainSpecification(page, browser),
          async () => await action.hoverReviewText(page, browser),
        ];
    
        // Shuffle the actions array to randomize the order
        const shuffledActions = array.shuffle(actions);
    
        // Execute each action in the randomized order
        for (const action of shuffledActions) {
          await action();
      
          await booster.addRandomTimeGap(2, 3);
        }

      } catch (error) {
        // console.log(error.message);
      }
      
    }catch(error) {
      if(!process.env.TURN_OFF_LOGS) {
        console.log(error.message);
      }

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
      const timeoutMilliseconds = 360000; // 6 minutes
      const timeoutSeconds = 360; // 6 minutes

      let productThreads = 1;
      let currentBatch = [];

      for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
        currentBatch.push(initBooster(product, timeoutSeconds, product.isPerPage ? 'per-page' : steps));
      }   
    


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

  await booster.addRandomTimeGap(2, 3)

  const productJsonFile = await dynamicallyImportJsonFile(currentVM + '.json');
  const products = productJsonFile.products.filter( item => !item.isOutOfStock);

  console.log(products.length);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {

    console.log('current thread:' + mainIndex);
    try {
      for (let index = 0; index < products.length; index++) {


        const timeoutMilliseconds = 360000; // 6 minutes
        const timeoutSeconds = 360; // 6 minutes

        let productThreads = 5;
        let currentBatch = [];

        for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
          await booster.addRandomTimeGap(2, 3);
          currentBatch.push(initBooster(products[index], timeoutSeconds, products[index].isPerPage ? 'per-page' : virtualMachine.steps, virtualMachine.proxy));
        }   

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
            // console.error('Error:', error.message);
          });
        }catch(error) {
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

