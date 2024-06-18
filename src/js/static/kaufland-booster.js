import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'
import * as proxies from '../../helpers/proxies.js';
import * as random from '../../helpers/random.js';

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

  try {
    if(steps == 'homepage') {
      link = booster.getRandomStartingUrl()
      keyword = booster.getRandomKeyword(product.keywords) 
    }else {
      if(product.keyword.length) {
        keyword = booster.getRandomKeyword(product.keyword) 
      }else {
        return;
      }
    }
   
  }catch(error) {
    console.log(error);
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
        '--no-sandbox'
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
    await page.goto(keyword.link, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    console.log(error);

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
    console.log(error.message);
    if(browser) {
      await browser.close();
    }
    return;
  }

  if(content) {
    try {
      // log session information

      // console.log(`proxy: ${proxy}`)
      // console.log(`user-agent: ${userAgentStr}`)

      await booster.addRandomTimeGap(5, 10);

      // Step: Click Accept Terms button on init
      const acceptTermsButton = '#onetrust-accept-btn-handler';
      await page.waitForSelector(acceptTermsButton);

      await booster.addRandomTimeGap(5, 10);
      await page.click(acceptTermsButton);

      // Step: Type into search box.
      // await booster.addTimeGap(4000);
      // await page.type('input[name="search_value"]', keyword, {delay: 300});

      // Step: Wait for suggest overlay to appear and click "show all results".

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
        try {
          await booster.scrollToRandomClass(page, '.product', browser);
        }catch(error) {
          // check for product 
        }
      }

      await booster.addRandomTimeGap(10, 12)

      try {
        const href = `/product/${productId}/?search_value=${keyword.name}`;
        const [element] = await page.$x(`//a[@href='${href}']`);
  
        if (element) {
          await element.click();
        } else {
          console.log(`keyword: ${keyword.name}: id ${product.productId}`)
          browser.close();
        }
        
      }catch(error) {
        // continue and ignore error
      }

      await booster.addRandomTimeGap(10, 12)

      await executeScrollSequence(page);

      for (let i = 1; i <= 5; i++) {
        await booster.addRandomTimeGap(3, 10)
        try {
          let imageGallery = `a[data-cs-override-id="image-gallery-thumbnail-${booster.generateNumberBetween(1, 6)}"]`;
          await page.waitForSelector(imageGallery);
          await page.hover(imageGallery)
          await booster.addRandomTimeGap(3, 10)
        }catch(error) {
          // wait and hover
        }
      }

      await executeScrollSequence(page);


      try {
        const clickReviews = `button[data-dd-action-name="cuco_helpful-vote-yes"]`;
        
        await page.waitForSelector(clickReviews, { timeout: 10000 });
        await booster.addRandomTimeGap(5, 7);
      
        // Click the element 2 to 5 times
        const clickTimes = booster.generateRandomNumber(2, 3);
        for (let i = 0; i < clickTimes; i++) {
          await page.hover(clickReviews);
          await booster.addRandomTimeGap(3, 4); // Random gap between hovers
          await page.click(clickReviews);
          await page.click(clickReviews);
          await booster.addRandomTimeGap(3, 5); // Random gap between clicks
        }
      } catch (error) {
      }

      // click cart
      try {

        const addToCartClick = `button[data-cs-override-id="add-to-cart-button"]`;
        
        await page.waitForSelector(addToCartClick, { timeout: 10000 });
        await booster.addRandomTimeGap(5, 7);
      
        // Hover over the custom element
        await page.hover(addToCartClick);
        await booster.addRandomTimeGap(3, 2);

        await page.click(addToCartClick);
        await booster.addRandomTimeGap(3, 5);
      } catch (error) {
        // continue
      }

      if(random.fiftyFiftyChance()) {
        try {
          const goToCart = 'div.rd-overlay button.rd-button--secondary > span'
          await page.waitForSelector(goToCart, { timeout: 10000 });
          await booster.addRandomTimeGap(5, 7);
        
          // Hover over the custom element
          await page.hover(goToCart);
          await booster.addRandomTimeGap(3, 2);

          await page.click(goToCart, { clickCount: 2 });
          await booster.addRandomTimeGap(3, 5);
        } catch (error) {
          // continue when error
        }
      }else {
        try {
          const closeModal = `button[data-cs-override-id="rd-add-to-cart-overlay__button-to-cart"]`;
          
          await page.waitForSelector(closeModal, { timeout: 10000 });
          await booster.addRandomTimeGap(5, 7);
        
          // Hover over the custom element
          await page.hover(closeModal);
          await booster.addRandomTimeGap(3, 2);

          await page.click(closeModal);
          await page.click(closeModal);
          await booster.addRandomTimeGap(3, 5);
        } catch (error) {
          // continue when error
        }
      }
      await executeScrollSequence(page);

      await booster.addRandomTimeGap(5, 7);

    }catch(error) {
      await browser.close();
    }
  }

  await browser.close();
}

const dynamicallyImportJsonFile = async (file)  => {
  const { default: jsonObject } = await import(`./../../assets/json/kaufland/${file}`, {
      assert: {
        type: 'json'
      }
  });

  return jsonObject
}

export const triggerAllBolKaufland = async (thread, currentVM, virtualMachine = {}) => {
  await booster.addRandomTimeGap(2, 2)

  const productJsonFile = await dynamicallyImportJsonFile(currentVM + '.json');
  const products = productJsonFile.products.filter( item => !item.isOutOfStock && item.keyword);

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
          //console.log(error.message)
          return;
        }
      }
    }catch (error) {
      //console.log(error.message)
      if(!process.env.TURN_OFF_LOGS) {
        console.error(error);
      }

      return;
    }
  }
};

