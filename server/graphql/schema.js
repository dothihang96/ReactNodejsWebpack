import { gql } from 'apollo-server-express';

/**
 * GraphQL Schema that describes the main functionality of the API
 *
 * https://www.apollographql.com/docs/apollo-server/schema/schema/
 */

const schema = gql`
  # ---------------------------------------------------------
  # Model and Root Query Objects
  # ---------------------------------------------------------
  type User {
    _id: ID!
    name: String!
    email: String!
    username: String!
    password: String!
    createdAt: String
    updatedAt: String
  }

  type Token {
    token: String!
  }

  type NewsContent{
    _id: ID!
    author: String
    title: String!
    description: String
    url: String
    urlToImage: String
    publishedAt: String!
    content: String!
    sourceId: ID!
  }
  
  # ---------------------------------------------------------
  # Input Objects
  # ---------------------------------------------------------
  input SignInInput {
    email: String!
    password: String!
  }

  input SignUpInput {
    email: String!
    name: String!
    password: String!
  }

  input GetNewsInput {
    title: String
    author: String
    content: String
    description: String
    limit: Int
    page: Int
  }

  # ---------------------------------------------------------
  # Return Payloads
  # ---------------------------------------------------------
  type UserPayload {
    _id: ID!
    email: String
    name: String
    createdAt: String
    updatedAt: String
  }
  
  type NewsData{
    total: Int,
    news: [NewsInfo]
  }

  type NewsInfo{
    _id: ID!
    author: String
    title: String!
    description: String
    url: String
    urlToImage: String
    publishedAt: String!
    content: String!
    sourceId: ID!
  }

  # ---------------------------------------------------------
  # Query Root
  # ---------------------------------------------------------
  type Query {
    # Gets the currently logged in user
    getAuthUser: UserPayload

    # Gets user by username
    getUser(name: String!): UserPayload

    # Gets news by search condition
    getNews(input: GetNewsInput): NewsData
  }

  # ---------------------------------------------------------
  # Mutation Root
  # ---------------------------------------------------------
  type Mutation {
    # Signs in user
    signin(input: SignInInput!): Token

    # Signs up user
    signup(input: SignUpInput!): UserPayload
  }
`;

export default schema;
