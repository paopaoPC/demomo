define([], function()
{
    'use strict';
    /**
     * Get the edit-distance according to Dice between two values.
     *
     * @param {*} value - First value.
     * @param {*} alternative - Second value.
     * @return {number} Edit distance.
     */
    return {
        diceCoefficient: function(value, alternative) {
            var pairs,
                alternativePairs,
                intersections,
                iterator,
                length,
                alternativeLength,
                alternativeIterator,
                alternativePair,
                pair;

            pairs = value;
            alternativePairs = alternative;
            intersections = 0;
            iterator = -1;
            alternativeLength = alternativePairs.length;
            length = pairs.length;

            while (++iterator < length) {
                pair = pairs[iterator];

                alternativeIterator = -1;

                while (++alternativeIterator < alternativeLength) {
                    alternativePair = alternativePairs[alternativeIterator];

                    if (pair === alternativePair) {
                        intersections++;

                        /*
                         * Make sure this pair never matches again
                         */

                        alternativePairs[alternativeIterator] = '';
                        break;
                    }
                }
            }

            return 2 * intersections / (pairs.length + alternativeLength);
        }
    }

});