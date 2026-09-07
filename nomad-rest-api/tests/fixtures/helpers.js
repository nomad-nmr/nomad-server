//Spread into supertest's .set() to authorise a request as a fixture user
//  .set(...authHeader(testUserAdmin))
//The token must come from a seeded fixture: middleware/auth.js verifies the JWT and also checks
//that the token is present in the user's tokens array in Mongo.
export const authHeader = user => ['Authorization', `Bearer ${user.tokens[0].token}`]
