import 'dotenv/config';
import * as booster  from '../../../helpers/boosterSteps.js'

export const clickPrivacyAndCountryButton = async (page, browser) => {
    try {
        const acceptTermsButtonXPath = `//*[@id='js-first-screen-accept-all-button']`;
        await booster.clickElement(page, browser, acceptTermsButtonXPath, booster.generateRandomNumber(500, 1000))

        await booster.addRandomTimeGap(3, 7);

        const countryLanguageButtonXPath = `//*[contains(@class, 'js-country-language-btn')]`;
        await booster.clickElement(page, browser, countryLanguageButtonXPath, booster.generateRandomNumber(500, 1000))

    } catch (error) {
        console.log(error.message)
        await browser.close();
    }
};

export const browseProducts = async (page, browser = null) => {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const numberOfIterations = getRandomInt(5, 7);
    
    for (let i = 0; i < numberOfIterations; i++) {
        await booster.scrollToRandomClass(page, '.list_page_product_tracking_target', browser, 'bol');
    }
}

export const clickCurrentProduct = async (page, browser, productId) => {
    try {
        const xpath = `//*[@data-config='{"product_id": "${productId}"}']`;
        await booster.clickElement(page, browser, xpath, booster.generateRandomNumber(500, 1000));
    } catch (error) {
        if (browser) {
            await browser.close();
        }

        return;
    }
};


export const browseProductImage = async (page, browser) => {
    let hoverAndClick = async () => {
        try {
            const randomSequence = booster.generateRandomSequence(1, 5);
            for (let i = 0; i < 5; i++) {
                const xpath = `//*[@data-test="product-thumb-image-${randomSequence[i]}"]`;
                await booster.clickElement(page, browser, xpath, booster.generateRandomNumber(500, 1000));
                await booster.addRandomTimeGap(1, 3);
    
            }
        } catch (error) {
            console.log('Error in hoverAndClick:', error);

            return
        }
    };

    let clickArrow = async () => {
        try {
            const xpathNext = `//*[@data-test="carousel-next"]`;
            await booster.clickElement(page, browser, xpathNext, booster.generateRandomNumber(500, 1000));
            await booster.addRandomTimeGap(3, 5);

            const xpathBack = `//*[@data-test="carousel-back"]`;
            await booster.clickElement(page, browser, xpathBack, booster.generateRandomNumber(500, 1000));
            await booster.addRandomTimeGap(2, 4);
        } catch (error) {

            return
        }
    };

    try {
        const randomFirstAction = Math.random();
        if (randomFirstAction < 0.5) {
            await hoverAndClick();
            await clickArrow();
        } else {
            await clickArrow();
            await hoverAndClick();
        }
    } catch (error) {
        return
    }
};

export const addToWishList = async (page, browser, productId, addedToWishlist = false) => {
      // Step: Add to wishlist & Add to cart
      if(!addedToWishlist) {
        const maxRetries = 5;
        let attempts = 0;
        let success = false;

        await booster.scrollDown(page);

        await booster.addRandomTimeGap(5, 6);

        while (attempts < maxRetries && !success) {
            try {
                await booster.scrollDown(page);
                const xpath = `//*[@global-id='${productId}']`;
                const element = await booster.clickElement(page, browser, xpath, booster.generateRandomNumber(500, 1000), 10000 , true);

                if (element) {
                await booster.addRandomTimeGap(5, 7);
                
                // Wait for and click the modal close button
                await page.waitForSelector('.modal__window--close-hitarea', { timeout: 10000 });
                await page.click('.modal__window--close-hitarea');

                // Add a random time gap after clicking (if needed)
                await booster.addRandomTimeGap(3, 5);

                success = true; // Set success to true if click is successful
                } else {
                console.log('Element not found');
                }
            } catch (error) {
                // continue
            }

          attempts++;
          
          // Wait before the next attempt (optional, for better pacing)
          if (!success) {
            await booster.addRandomTimeGap(3, 5);
          }
        }

        if (!success) {
          console.log(`Failed to click the element after ${maxRetries} attempts.`);
        }
    }else {
        return;
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
    const numberOfIterations = getRandomInt(3, 5);

    for (let i = 0; i < numberOfIterations; i++) {
        await booster.scrollToRandomClass(page, selector, browser);
    }
}

