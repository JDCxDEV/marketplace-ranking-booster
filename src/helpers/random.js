/**
 * Returns true or false with a 50/50 chance.
 * @returns {boolean} True with 50% probability, false otherwise.
 */
export const fiftyFiftyChance = () => {
    return Math.random() < 0.5;
};
/**
 * Generates a random integer between a given minimum and maximum range (inclusive).
 *
 * @param {number} min - The minimum value for the random number.
 * @param {number} max - The maximum value for the random number.
 * @returns {number} - A random integer between min and max (inclusive).
 */
export const generateRandomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
/**
 * Generates a random integer between a given minimum and maximum range (inclusive).
 *
 * @param {number} min - The minimum value for the random number.
 * @param {number} max - The maximum value for the random number.
 * @returns {number} - A random integer between min and max (inclusive).
 */
export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Determines the repeat times based on the product length.
 *
 * @param {number} length - The length of the product array.
 * @returns {number} - The number of times to repeat.
 */
export const determineRepeatTimes = (length = 0) => {
    if (length === 0) {
      return 0;
    } else if (length === 1) {
      return 1;
    } else if (length <= 3) {
      return getRandomInt(1, Math.ceil(length / 3));
    } else if (length <= 5) {
      return getRandomInt(3, Math.ceil(length / 3));
    } else {
      return getRandomInt(3, 6);
    }
};
  