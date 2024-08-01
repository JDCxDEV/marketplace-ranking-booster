import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth-fix';
import UserAgent from 'user-agents';
import pluginAnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import * as booster  from '../../helpers/boosterSteps.js'
import * as proxies from '../../helpers/proxies.js';
import * as action from './actions/media-markt.js'
import * as array from '../../helpers/array.js'
import * as init from '../../helpers/init.js'

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
 let keyword = null;

 if(steps == 'homepage') {
    // no homapage algorithm
 }else {
   if(product.keywordList.length) {
     keyword = booster.getRandomKeyword(product.keywordList) 
   }else {
     return;
   }
 }

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
 
       ignoreDefaultArgs: [
        '--enable-automation'
      ], // Exclude arguments that enable automation
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
   await page.goto(keyword.link, { waitUntil: 'domcontentloaded' });
 } catch (error) {
   console.log(error.message)
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
      
      // // Step: Add random scroll 
      await booster.generateAndExecuteScrollSequence(page, 4, 5);
      // // ----------- end of step ----------- //
      
      await booster.addRandomTimeGap(3, 4);

      //Step: Go to the designated product
      await action.clickProductPage(page, browser, product.productLink);

      await booster.addRandomTimeGap(10, 12);

      try {
        // Define the actions as an array of functions
        const actions = [
          async () => await action.addToCart(page, browser),
          async () => await booster.generateAndExecuteScrollSequence(page, 2, 4),
          async () => await action.clickImages(page, browser),
        ];
    
        // Shuffle the actions array to randomize the order
        const shuffledActions = array.shuffle(actions);
    
        // Execute each action in the randomized order
        for (const action of shuffledActions) {
          await action();
      
          await booster.addRandomTimeGap(2, 3);
        }

      } catch (error) {
        console.log(error.message);
      }
      
    }catch(error) {
      console.log(error.message);
      if(!process.env.TURN_OFF_LOGS) {
        console.log(error.message);
      }

      if(browser) {
        await browser.close();
      }
    }
  }

  if(browser) {
    await browser.close();
  }
}

export const triggerAllMediaMarktBooster = async (thread, currentVM, virtualMachine = {}) => {
  await init.startBooster(thread, currentVM, virtualMachine, 5, 'mediamarkt', await initBooster);
};

