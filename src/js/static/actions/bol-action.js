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
            console.log('click!!!!! image')
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
            console.log('click!!!!!')
        } catch (error) {
            console.log('Error in clickArrow:', error);

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
        console.log('Error in browseProductImage:', error);

        return
    }
};

export const clickSpecification = async () => {

}

export const randomScrolling = async () => {

}

export const addToWishList = async () => {

}


export const clickShowMore = async () => {

}

export const hoverToReviewText = async () => {
    
}

export const hoverUpsaleText = async () => {

}

export const deliveryOption = async () => {
    
}
