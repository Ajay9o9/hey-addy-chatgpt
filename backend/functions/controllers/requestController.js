/**
 * @desc Check if request contains all the data that it needs
 */

function requestContainsAllRequiredData(request, dataType, requiredParams) {

    for (let i = 0; i < requiredParams.length; i++) {
        const param = requiredParams[i];
        if (!request[dataType][param]) return false;
    }
    return true;
}

module.exports = {
    requestContainsAllRequiredData,
}