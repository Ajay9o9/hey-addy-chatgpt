/**
 * This file contains config data for different environments and
 * stacks. For instance configuration for dev vs prod
 * The dev branch will contain dev config and main branch will
 * contain prod config
 */

const PASSWORD = "JellyBean99";
const EMAIL = "mvandi.yt@gmail.com";

const apiAccessClientAddresses = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000",
    "localhost",
];

module.exports = {
    apiAccessClientAddresses,
    PASSWORD,
    EMAIL,
};
