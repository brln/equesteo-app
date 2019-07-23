module.exports = {
    "parser": "babel-eslint",
    "env": {
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "react-native",
    ],
    "rules": {
        "no-unused-vars": ["off"],
        "no-undef": ["off"],
        "no-case-declarations": ["off"],

        "react/no-unsafe": ["error", { "checkAliases": true }]
    }
};