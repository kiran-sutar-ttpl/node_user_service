module.exports = {
    collectCoverage: true,
    roots: ['__tests__/unit'],
    testEnvironment: 'node',
    testMatch: ['**/*.test.js'],
    coverageDirectory: 'coverage',
    testTimeout: 60000 * 2,
}
