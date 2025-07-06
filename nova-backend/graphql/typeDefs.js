const { gql } = require('apollo-server-express');

module.exports = gql` type User {
    _id: ID!
    name: String
    email: String
    username: String
    role: String!
    age: Int
    children: [Child]
    notifications: [Notification]
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Child {
    id: ID!
    name: String!
    age: Int!
    parent: ID!
    username: String!
    xp: Int
    badges: [String]
    assignments: [Assignment]
    triviaResults: [TriviaResult]
  }

  type AIContent {
    imageUrl: String!
    explanation: String!
  }

  type Puzzle {
    imageUrl: String!
    question: String!
    answer: String!
  }

  type PuzzleFeedback {
    feedback: String!
  }

  type Question {
    type: String!
    prompt: String!
    options: [String]
    answer: String
  }

  type Response {
    questionIndex: Int!
    answer: String!
  }

  input QuestionInput {
    type: String!
    prompt: String!
    options: [String]
    answer: String
  }

  input ResponseInput {
    questionIndex: Int!
    answer: String!
  }

  enum Difficulty {
    EASY
    MEDIUM
    HARD
  }

  type Assignment {
    id: ID!
    title: String!
    description: String!
    status: String!
    child: Child!
    questions: [Question]
    responses: [Response]
    evaluation: [AnswerEvaluation]
    createdAt: String!
    completedAt: String
    feedback: String
    difficulty: String
    totalCorrect: Int
    score: Float
  }

  type TriviaResult {
    id: ID!
    childId: ID!
    score: Int!
    date: String!
  }

  type Notification {
    message: String
    date: String
  }

  type AnswerEvaluation {
    questionIndex: Int!
    isCorrect: Boolean!
    feedback: String
  }

  input AnswerEvaluationInput {
    questionIndex: Int!
    isCorrect: Boolean!
    feedback: String
  }

  type AssignmentResponse {
    assignmentId: ID!
    responses: [Response!]!
    evaluation: [AnswerEvaluation!]
    totalCorrect: Int
    score: Float
  }

  type Query {
    getMe: User
    getMyChildren: [Child]
    getChildById(id: ID!): Child
    getAssignmentsForChild(childId: ID!): [Assignment]
    getMyAssignments: [Assignment]
    getParentNotifications(limit: Int): [Notification]
    getFunImage: AIContent
    generatePuzzleFromTopic(topic: String!): Puzzle
    evaluatePuzzleAnswer(question: String!, userAnswer: String!): PuzzleFeedback
  }

  type Mutation {
    registerParent(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String, username: String, password: String!): AuthPayload!
    createChildProfile(name: String!, age: Int!, username: String!, password: String!): Child!

    createAssignment(childId: ID!, title: String!, description: String!, questions: [QuestionInput!]!, difficulty: Difficulty): Assignment!
    updateAssignmentStatus(assignmentId: ID!, status: String!, responses: [ResponseInput]): Assignment!
    updateAssignmentFeedback(assignmentId: ID!, feedback: String!): Assignment!

    saveTriviaScore(childId: ID!, score: Int!): TriviaResult!
    updateChildXP(childId: ID!, xp: Int!): Child!
    addChildBadge(childId: ID!, badge: String!): Child!

    evaluateAssignmentResponse(
      childId: ID!
      assignmentId: ID!
      evaluation: [AnswerEvaluationInput!]!
    ): AssignmentResponse!
  }
`;
