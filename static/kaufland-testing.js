import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from './helpers/boosterSteps.js'


const initBooster = async (product) => {

  // Parameters
  const keyword = booster.getRandomKeyword(product.keywords) 
  const link = 'https://www.kaufland.de/'
  const productLink =  product.productLink
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
    args: [`--proxy-server=${proxy}`],
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
      console.log(`proxy: ${proxy}`)
      console.log(`user-agent: ${userAgentStr}`)

      await booster.addTimeGap(1000);

      // Step 1: Click Accept Terms button on init
      const acceptTermsButton = '#onetrust-accept-btn-handler';
      await page.waitForSelector(acceptTermsButton);
      await page.click(acceptTermsButton);

      // Step 2: Type into search box.
      await booster.addTimeGap(1000);
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
      const hasCategorySelect = await page.waitForSelector('.rd-select__select');
      if(hasCategorySelect) {
        await page.select('.rd-select__select', 'bestsellers')
      }

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
          return null; // Return null if the href is not found
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
  
          }
        
          return false
        }
      }

      const paginationButtons = [];

      const scrollDown = async () => {
        await page.evaluate(() => {
          const scrollStep = 250; // Adjust the scrolling step as needed
          const scrollInterval = 150; // Adjust the scrolling interval (ms) as needed
  
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
  
          // Stop smooth scrolling after a certain time (e.g., 5000 ms)
          setTimeout(() => {
            clearInterval(scrollIntervalId);
          }, 7000);
        });
      } 

      while(foundProduct !== true) {
        await booster.addTimeGap(7000)
        await scrollDown()
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


export const triggerBooster = async (thread, product) => {
  console.error('staring the booster!')
  for (let index = 0; index <= thread; index++) {
    try {
      await initBooster(product) 
    }catch (error) {
      console.error(error);
    }
  }
};
