import 'dotenv/config';
import * as booster  from '../../../helpers/boosterSteps.js'
import * as random from '../../../helpers/random.js'
export const clickPrivacyAndCountryButton = async (page, browser) => {
    try {
        const acceptTermsButtonXPath = `//*[@id='pwa-consent-layer-accept-all-button']`;
        await booster.clickElement(page, browser, acceptTermsButtonXPath, random.getRandomInt(500, 1000))

    } catch (error) {
        await browser.close();
    }
};

export const clickProductPage = async (page, browser, productLink) => {
    try {
        const acceptTermsButtonXPath = `//*[@href="${productLink}"]`
        await booster.clickElement(page, browser, acceptTermsButtonXPath, random.getRandomInt(500, 1000))
    } catch (error) {
        await browser.close();
    }
};

export const addToCart = async (page, browser) => {
    try {
        const selector = `[id="pdp-add-to-cart-button"]`;
       await booster.clickElementBySelector(page, browser, selector, 3000, 4000);
        
        // Optional: Add a random time gap between clicks
        await booster.addRandomTimeGap(2, 3);
        const xpath = `//*[@data-test="pre-checkout-drawer"]/div[1]/div/button/span`;
        await booster.clickElement(page, null, xpath, booster.generateRandomNumber(500, 1000));
    }catch(error) {
        console.log(error.message)
    }
};

export const clickImages = async (page, browser) => {
    for (let i = 0; i < 4; i++) {
        try {
            const selector = `[data-test='mms-th-gallery'] li:nth-of-type(${random.generateRandomBetween (1, 5)}) img`;
            await booster.clickElementBySelector(page, browser, selector, 3000, 4000)

            await booster.addRandomTimeGap(1, 2);
        } catch (error) {
            // continue on next iteration
        }
    }
};