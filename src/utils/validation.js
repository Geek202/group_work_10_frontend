'use strict';

/**
 * Validates the marks percentage.
 * @param {number} percentage - The percentage to validate.
 * @returns {boolean} - Returns true if the percentage is between 0 and 100, false otherwise.
 */
function validatePercentage(percentage) {
    if (typeof percentage !== 'number') {
        throw new Error('Input must be a number.');
    }
    return percentage >= 0 && percentage <= 100;
}

module.exports = { validatePercentage };