import * as booster  from '../../helpers/boosterSteps.js'
import * as proxies from '../../helpers/proxies.js';
import * as action from './actions/bol.js'
import * as array from '../../helpers/array.js'
import { plugin } from 'puppeteer-with-fingerprints';

const initBooster = async (product, threadTimer = 300, steps, proxyProvider) => {
  const fingerprint = await plugin.fetch('R1Q984LgHhqw8Dx5xBHkEjStoC50FScwFgkoqjT8uSI1TBItRAkceXqKfGXUyO1k', {
    tags: ['Desktop'],
    timeLimit: '15 days',
  });

  try {
    plugin.useFingerprint(fingerprint);
    const proxy = await proxies.getAssignedProxies(proxyProvider);

    plugin.useProxy(proxy.host, {
      changeTimezone: true,
      changeGeolocation: true,
    });
  } catch (error) {
    //console.error('Error using proxy or fingerprint:', error);
    return;
  }

  let browser = null;

  const timerId = setTimeout(async () => {
    if (browser) {
      await browser.close();
    }

    return
  }, threadTimer * 1000);

  try {
    browser = await plugin.launch({ 
      headless: false,
    });

    const page = await browser.newPage();
    const link = getLink(product, steps);

    if (!link) return;

    await page.goto(link, { waitUntil: 'domcontentloaded' });

    if (await isTooManyRequests(page)) {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }

    const content = await page.content();

    if (!content) {
      throw new Error('Failed to load page content');
    }

    await performActions(page, browser, product);

  } catch (error) {
    // console.error('Error during browser interaction:', error);
    clearTimeout(timerId);
    if (browser) {
      await browser.close();
    }

    return;
  }
};

const getLink = (product, steps) => {
  if (steps === 'homepage') {
    return booster.getRandomStartingUrl();
  } else if (product.keywordLink.length) {
    return booster.getRandomKeyword(product.keywordLink);
  } else {
    return null;
  }
};

const isTooManyRequests = async (page) => {
  return await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 && h1.textContent === 'Too Many Requests';
  });
};

const performActions = async (page, browser, product) => {
  const productId = product.productId;
  await booster.addRandomTimeGap(6, 8);
  await action.clickPrivacyAndCountryButton(page, browser);
  await booster.addRandomTimeGap(4, 5);
  await action.clickProductListChangeView(page, browser);
  await booster.addRandomTimeGap(4, 6);
  await booster.generateAndExecuteScrollSequence(page, 4, 5);
  await booster.addRandomTimeGap(3, 4);
  await action.browseProducts(page, browser);
  await booster.addRandomTimeGap(3, 4);

  const addedToWishlist = await action.clickToWishList(page, browser, productId);
  await booster.addRandomTimeGap(3, 4);
  await action.clickProductListChangeView(page, browser);
  await booster.addRandomTimeGap(4, 6);

  if (!(await action.clickCurrentProduct(page, browser, productId))) {
    //throw new Error('Failed to navigate to product');
  }

  await booster.addRandomTimeGap(8, 10);
  await action.addToWishList(page, browser, productId, addedToWishlist);
  await booster.addRandomTimeGap(3, 4);

  const actions = [
    async () => await action.hoverUpsaleText(page, browser),
    async () => await booster.generateAndExecuteScrollSequence(page, 2, 4),
    async () => await action.browseProductImage(page, browser),
    async () => await action.clickShowMoreDescription(page, browser),
    async () => await action.clickShowMoreMainSpecification(page, browser),
    async () => await action.hoverReviewText(page, browser),
  ];

  const shuffledActions = array.shuffle(actions);

  for (const action of shuffledActions) {
    await action();
    await booster.addRandomTimeGap(2, 3);
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

export const triggerAllBolBoosterFingerPrint = async (thread, currentVM, virtualMachine = {}) => {
  await booster.addRandomTimeGap(2, 3);

  const productJsonFile = await dynamicallyImportJsonFile(currentVM + '.json');
  const products = productJsonFile.products.filter(item => !item.isOutOfStock);

  console.log(`Total products: ${products.length}`);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {
    console.log(`Current thread: ${mainIndex}`);

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    try {
      for (let index = 0; index < products.length; index++) {
        await processProductBatch(products[index], virtualMachine);
        console.log(`Product ${index + 1} in thread ${mainIndex} completed.`);
      }
    } catch (error) {
      handleError(error);
      return;
    }
  }
};

const processProductBatch = async (product, virtualMachine) => {
  const timeout = 6 * 60 * 1000; // 6 minutes in milliseconds
  const timeoutSeconds = 360; // 6 minutes
  const productThreads = 4;
  let currentBatch = [];

  for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
    await booster.addRandomTimeGap(2, 3);
    currentBatch.push(
      initBooster(
        product,
        timeoutSeconds,
        product.isPerPage ? 'per-page' : virtualMachine.steps,
        virtualMachine.proxy
      )
    );
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout exceeded'));
    }, timeout);
  });

  await handleBatchProcessing(currentBatch, timeoutPromise);
};

const handleBatchProcessing = async (batch, timeoutPromise) => {
  try {
    await Promise.race([Promise.all(batch), timeoutPromise]);
  } catch (error) {
    return;
    // console.error('Error:', error.message);
  }
};

const handleError = (error) => {
  // console.error(error.message);
};