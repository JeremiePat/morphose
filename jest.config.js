export default {
  testMatch: ['**/*.tests.js'],
  collectCoverageFrom: [
    'lib/**/*.js',
    '!**/__tests__/*.js'
  ],
  coverageReporters: ['text', 'html']
}
