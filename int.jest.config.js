module.exports = {
    verbose: true,
    collectCoverage: true,
    roots: ['__tests__/int'],
    testEnvironment: 'node',
    testMatch: ['**/*.int.js'],
    coverageDirectory: 'coverage',
    testTimeout: 60000 * 5, // 5 minutes timeout
}
