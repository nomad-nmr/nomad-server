import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    //mock call history is reset between tests so assertions cannot pass off an earlier test
    clearMocks: true,
    restoreMocks: true,
    //MongoMemoryServer.create() in connectDB can exceed the 10s default on first run
    hookTimeout: 30000,
    coverage: {
      provider: 'v8'
    }
  }
})
