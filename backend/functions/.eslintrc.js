module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    rules: {
        "quotes": ["error", "double"],
        "indent": ["warn", 4],
        "semi": [1, "always"],
        "require-jsdoc": 0,
        "new-cap": 0,
        "max-len": ["error", {
            "code": 84,
            "ignoreUrls": true, "ignoreStrings": true,
        }],
        "linebreak-style": 0,
        "space-before-blocks": 0,
    },
    parser: "babel-eslint",
    parserOptions: {
        "sourceType": "module",
        "ecmaVersion": 2018,
        "ecmaFeatures": {
            "jsx": true,
            "modules": true,
        },
    },
};
