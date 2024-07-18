module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        'react',
    ],
    rules: {
        // Your custom rules
        'react/prop-types': 'off',
        'no-unused-vars': 'warn',
        'no-console': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
