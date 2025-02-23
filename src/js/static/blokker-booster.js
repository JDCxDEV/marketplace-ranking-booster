import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js';
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
  }, threadTimer * 1000);

  // Parameters
  let link = null;
  let keyword = null;

  if(steps == 'homepage') {
    const links = ['https://www.blokker.nl/']
    link = booster.getRandomStartingUrl(links)
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
    console.log(error.message)
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

    console.log(error.message);
    return;
  } 

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    console.log(error);
    await browser.close()
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


      await booster.addRandomTimeGap(6, 10);

      try {
        const promoModal = '.js-content-modal-close';
        
        await page.waitForSelector(promoModal, { timeout: 10000 });
        
        await page.click(promoModal);
        await booster.addRandomTimeGap(3, 6);
      } catch (error) {
          // no modal
      }

      await booster.scrollDown(page);
      await booster.addRandomTimeGap(3, 6);

      if(steps == 'homepage') {
          // Scroll to the element
          await page.evaluate(() => {
            const element = document.querySelector('.search-field');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
          });


          // Step: Type into search box.
          await booster.addRandomTimeGap(3, 6);
          await page.type('.search-field', keyword, {delay: 300});

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
        await booster.scrollToRandomClass(page, '.product-tile--visual-quickview');
      }

      // Step: Go to product page
      await booster.addRandomTimeGap(3, 7);

      const selector = `[data-pid="${productId}"]`;

      // Wait for the element to be present in the DOM
      await page.waitForSelector(selector);
    
      // Click the element
      await page.click(selector);
      

      await booster.addRandomTimeGap(3, 7);
      for (let i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++) {
        await booster.scrollToRandomClass(page, '.product-tile__image__container', browser);
      }

      // Step: Add to wishlist & Add to cart

      try {
        await page.click('.js-wishlist-btn');
        await booster.addRandomTimeGap(3, 7);
        await page.click('.wishlist-modal__close');
      }catch (error) {
        if(browser) {
          await browser.close();
        }

        return;
      } 

      
      await booster.addRandomTimeGap(3, 6);

    }catch(error) {
      console.log(error.message);
      if(browser) {
        await browser.close();
      }
    }
  }

  await browser.close();
}

const dynamicallyImportJsonFile = async (file)  => {
  const { default: jsonObject } = await import(`./../../assets/json/blokker/${file}`, {
      assert: {
        type: 'json'
      }
  });

  return jsonObject
}

export const triggerAllBlokkerBooster = async (thread, currentVM, virtualMachine = {}) => {

  await booster.addRandomTimeGap(1, 3)

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
          await booster.addRandomTimeGap(2, 2);
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

