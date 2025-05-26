const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
    email: String!
    role: String!
    children: [Child]
    notifications: [Notification]
  }

  type Parent {
    id: ID!
    email: String!
    password: String!
    children: [Child]
  }

  type Child {
    id: ID!
    name: String!
    age: Int!
    parent: ID!
    username: String!
    password: String!
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

  type Assignment {
  id: ID!
  title: String!
  description: String!
  status: String!
  child: Child!
  questions: [Question]
  responses: [Response]
  createdAt: String!
  feedback: String
  difficulty: String
}

type TriviaResult {
  id: ID!
  childId: ID!
  score: Int!
  date: String!
}

  type AuthPayload {
    token: String!
    user: User
    child: Child
  }

type Notification {
  message: String
  date: String
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
    registerParent(email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createChildProfile(name: String!, age: Int!, username: String!, password: String!): Child
    loginChild(username: String!, password: String!): AuthPayload
    
    createAssignment(childId: ID!, title: String!, description: String!, questions: [QuestionInput!]!): Assignment
    updateAssignmentStatus(assignmentId: ID!, status: String!, responses: [ResponseInput]): Assignment
    updateAssignmentFeedback(assignmentId: ID!, feedback: String!): Assignment
    
    saveTriviaScore(childId: ID!, score: Int!): TriviaResult
    updateChildXP(childId: ID!, xp: Int!): Child
    addChildBadge(childId: ID!, badge: String!): Child

    }
`;
