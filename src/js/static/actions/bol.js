import 'dotenv/config';
import * as booster  from '../../../helpers/boosterSteps.js'
import * as random from '../../../helpers/random.js'

export const clickPrivacyAndCountryButton = async (page, browser) => {
    try {
        const acceptTermsButtonXPath = `//*[@id='js-first-screen-accept-all-button']`;
        await booster.clickElement(page, browser, acceptTermsButtonXPath, booster.generateRandomNumber(500, 1000))

        await booster.addRandomTimeGap(3, 4);

        const countryLanguageButtonXPath = `//*[contains(@class, 'js-country-language-btn')]`;
        await booster.clickElement(page, browser, countryLanguageButtonXPath, booster.generateRandomNumber(500, 1000))

    } catch (error) {
        await browser.close();
    }
};

export const browseProducts = async (page, browser = null) => {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const numberOfIterations = getRandomInt(2, 4);
    
    for (let i = 0; i < numberOfIterations; i++) {
        await booster.scrollToRandomClass(page, '.list_page_product_tracking_target', browser, 'bol');
    }
}

export const clickCurrentProduct = async (page, browser, productId) => {
    const xpath = `//*[@data-config='{"product_id": "${productId}"}']`;
    const isClicked = await booster.clickElement(page, browser, xpath, booster.generateRandomNumber(500, 1000), 5000);

    return isClicked
};

export const clickToWishList = async (page, browser, productId) => {
    try {
        const selector = `[global-id="${productId}"]`;
        const isClicked = await booster.clickElementBySelector(page, browser, selector, 3000, 4000);
        
        if(isClicked) {        
            // Wait for and click the modal close button
            await booster.addRandomTimeGap(2, 5);
            await page.waitForSelector('.modal__window--close-hitarea', { timeout: 10000 });
            await page.click('.modal__window--close-hitarea');

            return true;
        }else {
            return false;
        }
    }catch(error) {
        return false
    }
};


export const browseProductImage = async (page, browser) => {
    const randomDelay = (min, max) => {
      return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
    };
  
    const hoverAndClick = async () => {
      const randomSequence = booster.generateRandomSequence(1, 5);
      for (let i = 0; i < 5; i++) {
        const xpath = `//*[@data-test="product-thumb-image-${randomSequence[i]}"]`;
        await booster.clickElement(page, null, xpath, booster.generateRandomNumber(500, 1000));
        await randomDelay(2000, 2500);
      }
    };
  
    const clickArrow = async () => {
      const xpathNext = `//*[@data-test="carousel-next"]`;
      await booster.clickElement(page, null, xpathNext, booster.generateRandomNumber(500, 1000));
      await randomDelay(2000, 2500);
  
      const xpathBack = `//*[@data-test="carousel-back"]`;
      await booster.clickElement(page, null, xpathBack, booster.generateRandomNumber(500, 1000));
      await randomDelay(2000, 2500);
    };
  
    try {
      const randomTimes = random.generateRandomBetween(2, 3);
  
      for (let i = 0; i < randomTimes; i++) {
        const randomFirstAction = Math.random();
        if (randomFirstAction < 0.5) {
          await hoverAndClick();
          await clickArrow();
        } else {
          await clickArrow();
          await hoverAndClick();
        }
  
        await randomDelay(1000, 2000);
      }
    } catch (error) {
      console.log(error.message)
    }
  };

export const addToWishList = async (page, browser, productId, addedToWishlist = false) => {
      // Step: Add to wishlist & Add to cart
      if(!addedToWishlist) {
        const maxRetries = 5;
        let attempts = 0;
        let success = false;

        await booster.addRandomTimeGap(5, 6);

        while (attempts < maxRetries && !success) {
            try {    
                // First XPath
                let xpath = `//*[@data-test="btn-wishlist"]/button`;
                let success = await booster.clickElement(page, null, xpath, booster.generateRandomNumber(500, 1000), 10000, true);
        
                // If the first XPath fails, try the second XPath
                if (!success) {
                    await booster.scrollDown(page);
                    xpath = `//*[@global-id='${productId}']`;
                    success = await booster.clickElement(page, null, xpath, booster.generateRandomNumber(500, 1000), 10000, true);
                }
        
                if (success) {
                    await booster.addRandomTimeGap(4, 5);
        
                    // Wait for and click the modal close button
                    await page.waitForSelector('.modal__window--close-hitarea', { timeout: 10000 });
                    await page.click('.modal__window--close-hitarea');
        
                    // Add a random time gap after clicking (if needed)
                    await booster.addRandomTimeGap(3, 5);
                }
            } catch (error) {
                // Continue to next attempt
            }
        
            attempts++;
        
            // Wait before the next attempt (optional, for better pacing)
            if (!success) {
                await page.reload();
                await booster.addRandomTimeGap(3, 5);
            }
        }
    }
}

export const clickShowMoreDescription = async (page, browser) => {
    const selector = 'section.slot--description [data-test="show-more"]';
    await booster.clickElementBySelector(page, browser, selector);
    await booster.addRandomTimeGap(2, 3);
    await booster.scrollDown(page);
}

export const clickShowMoreMainSpecification = async (page, browser) => {
    try {
        const selectorAnchorMainSpec = "[data-test='main-specs-slot'] a";
        await booster.clickElementBySelector(page, browser, selectorAnchorMainSpec);
        await booster.addRandomTimeGap(2, 3);

        const selectorShowMoreMainSpec = 'section.js_slot-specifications [data-test="show-more"]';
        await booster.clickElementBySelector(page, browser, selectorShowMoreMainSpec);
        await booster.addRandomTimeGap(2, 3);
        await booster.scrollDown(page);
    }catch(error) {
        return;
    }
}

export const hoverUpsaleText = async (page, browser) => {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const selector = '.skeleton-image.skeleton-image--with-placeholder.skeleton-image--contain';
    const numberOfIterations = getRandomInt(4, 6);
    for (let i = 0; i < numberOfIterations; i++) {
        await booster.scrollToRandomClass(page, selector, browser);
    }
}

export const hoverReviewText = async (page, browser) => {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const selector = '.review.js-review';
    const numberOfIterations = getRandomInt(3, 5);

    for (let i = 0; i < numberOfIterations; i++) {
        await booster.scrollToRandomClass(page, selector, browser);
    }
}

export const createAccount = async () => {
    const selector = `[data-test="login-link"]`;
    const isClicked = await booster.clickElementBySelector(page, browser, selector, 3000, 5000);
    await booster.addRandomTimeGap(2, 3);
}

export const clickProductListChangeView = async (page) => {
    let xpath = `//*[@data-analytics-id="px_listpage_change_viewmode"]`;
    await booster.clickElement(page, null, xpath, booster.generateRandomNumber(500, 1000), 10000, true);
}

export const changeProductListFilterView = async (page) => {
    const xpath = `//*[@id="sort"]`;
  
    const [selectElement] = await page.$x(xpath);
  
    if (selectElement) {
      const options = [
          'popularity1',
          'price0',
          'release_date1',
          'rating1',
          'wishListRank1'
      ];
  
      const randomValue = options[Math.floor(Math.random() * options.length)];
  

      await page.evaluate((element, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change')); // Trigger change event if needed
      }, selectElement, randomValue);
  
      console.log("Value changed to:", randomValue);
    } else {
      console.error("Element not found");
    }
};