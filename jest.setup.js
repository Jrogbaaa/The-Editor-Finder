import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('./src/lib/firebase', () => ({
  db: jest.fn(),
  auth: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Setup global test environment
beforeEach(() => {
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear()
  }
})

// Mock process.env
process.env.APIFY_API_TOKEN = 'mock-token'
process.env.NEXT_PUBLIC_APIFY_TOKEN = 'mock-token' 