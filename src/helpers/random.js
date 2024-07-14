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
  