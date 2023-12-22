import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'
import { executablePath  } from 'puppeteer';

const initBooster = async (product) => {

  // Parameters
  const keyword = booster.getRandomKeyword(product.keywords) 
  const link = 'https://www.kaufland.de/'
  const productLink =  product.productId
  const proxy = await booster.getRandomProxy()

  // Set stealth plugin
  const stealthPlugin = StealthPlugin();
  puppeteer.use(stealthPlugin);

  // Create random user-agent to be set through plugin
  const userAgent = new UserAgent({ platform: 'Win32', deviceCategory: 'desktop'});
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
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      ],

      ignoreDefaultArgs: ['--enable-automation'], // Exclude arguments that enable automation
  });
    
  const page = await browser.newPage();
  await page.setUserAgent(userAgentStr);
  await page.setViewport({ width: 1600, height: 1000, isMobile: false, isLandscape: true, hasTouch: false, deviceScaleFactor: 1 });

  try {
    await page.goto(link);
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


  if(url != link) {
    await browser.close();
  }
    
  if(content) {
    try {
      // log session information

      // console.log(`proxy: ${proxy}`)
      // console.log(`user-agent: ${userAgentStr}`)

      await booster.addTimeGap(1000);

      // Step 1: Click Accept Terms button on init
      const acceptTermsButton = '#onetrust-accept-btn-handler';
      await page.waitForSelector(acceptTermsButton);
      await page.click(acceptTermsButton);

      // Step 2: Type into search box.
      await booster.addTimeGap(4000);
      await page.type('input[name="search_value"]', keyword, {delay: 300});

      // Step 3: Wait for suggest overlay to appear and click "show all results".
      await booster.addTimeGap(2000);
      await page.$$eval(".rh-search__button", els => 
        els.forEach((el) =>{
          if(el.className == 'rh-search__button rd-button rd-button--icon') {
            el.click()
          }
        })
      )

      // Step 5: Scroll to the product and click it.
      await booster.addTimeGap(2000)


      // Step 6: Scroll to the product and click it.
      await booster.addTimeGap(4000)

      let foundProduct = false

      const findProduct = async () => {
        const anchor = await page.$$eval('a.product__wrapper', (anchors, productLink) => {
          console.log(anchors)
          for (const anchor of anchors) {
            if (anchor.href.includes(productLink)) {
                anchor.click()
                return true;
            }
          }
          return null; 
        }, productLink);
      
        if (anchor) {
          foundProduct = true
        }else {
          await page.waitForSelector('nav.rd-pagination');

          try {
            const paginationButtons = await page.$$('nav.rd-pagination button');
  
            if (paginationButtons.length > 0) {
              await booster.addTimeGap(5000)
              await paginationButtons[paginationButtons.length - 1].click();
            }
          }catch (error) {
            await browser.close();
          }
        
          return false
        }
      }

      const scrollDown = async (page) => {
        await page.evaluate(() => {
          const scrollStep = 250;
          const scrollInterval = 150;
  
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
          }, 7000);
        });
      } 

      while(foundProduct !== true) {
        await booster.addTimeGap(7000)
        await scrollDown(page)
        await page.waitForSelector('.results--grid');

        await findProduct()

        await booster.addTimeGap(5000)
      }

      await booster.addTimeGap(4000)

      // Step 7: hover to page image.
      await page.waitForSelector('a[data-cs-override-id="image-gallery-thumbnail-1"]', {
        visible: true,
      })

      for (let i = 1; i <= 5; i++) {
        await page.hover(`a[data-cs-override-id="image-gallery-thumbnail-${booster.generateNumberBetween(1, 6)}"]`)
        await booster.addRandomTimeGap(3, 10)
      }

      // Step 8: go to product information
      await booster.addRandomTimeGap(3, 10)
      await booster.addTimeGap(2000);

      await page.$$eval(".rd-button--link-overwrite", els => 
        els.forEach((el) =>{
          if(el.className == 'rd-link rd-link--primary rd-button--link-overwrite') {
            el.click()
          }
        })
      )
    }catch(error) {
      console.log(error)
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

export const triggerKauflandBooster = async (thread, product) => {

  await booster.addRandomTimeGap(3)

  for (let index = 0; index <= thread; index++) {
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

export const triggerAllBolKaufland = async (thread, currentVM) => {

  await booster.addRandomTimeGap(3)

  const productJsonFile = await dynamicallyImportJsonFile( currentVM + '.json');
  const products = productJsonFile.products.filter( item => !item.isOutOfStock);

  console.log(products.length);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {

    console.log('current thread:' + mainIndex);
    try {
      for (let index = 0; index < products.length; index++) {
        await booster.addRandomTimeGap(3);

        let productThreads = 6;
        let currentBatch = [];

        for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
           currentBatch.push(initBooster(products[index]));
        }   
        
        try {
          await Promise.all(currentBatch).then(() => {
            console.log(console.log('current thread:' + mainIndex + ' completed'));
          });
         } catch(error) {
          console.log(error)
        }

      }
    }catch (error) {
      if(!process.env.TURN_OFF_LOGS) {
        console.error(error);
      }
    }
  }
};

