import * as booster from './boosterSteps.js';
import * as server from './server.js';

export const startBooster = async (thread, currentVM, virtualMachine = {}, productThreads = 5, marketplaceKey, initBooster) => {
  await booster.addRandomTimeGap(4, 5);

  const productJsonFile = await server.dynamicallyImportJsonFile(`../assets/json/${marketplaceKey}/`, `${currentVM}.json`);
  const products = productJsonFile.products.filter(item => !item.isOutOfStock);

  console.log(products.length);

  for (let mainIndex = 1; mainIndex <= thread; mainIndex++) {
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    console.log('current thread:' + mainIndex);
    try {
      for (let index = 0; index < products.length; index++) {
        await processProductBatch(products[index], productThreads, virtualMachine, initBooster);
      }
    } catch (error) {
      handleError(error);
    }
  }
};

const processProductBatch = async (product, productThreads, virtualMachine, initBooster) => {
  const timeoutMilliseconds = 360000; // 6 minutes
  const timeoutSeconds = 360; // 6 minutes

  let currentBatch = [];

  for (let threadIndex = 0; threadIndex < productThreads; threadIndex++) {
    await booster.addRandomTimeGap(2, 3);
    currentBatch.push(initBooster(product, timeoutSeconds, product.isPerPage ? 'per-page' : virtualMachine.steps, virtualMachine.proxy));
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout exceeded'));
    }, timeoutMilliseconds);
  });

  try {
    await Promise.race([Promise.all(currentBatch), timeoutPromise]).then(() => {
      console.log('Batch processing completed');
    }).catch(error => {
      handleError(error);
    });
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  console.error(error.message);
};
