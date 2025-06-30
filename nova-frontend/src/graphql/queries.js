import { gql } from '@apollo/client';

export const GET_CHILD_BY_ID = gql`
  query GetChildById($id: ID!) {
    getChildById(id: $id) {
      name
      age
      xp
      badges
    }
  }
`;

export const GET_MY_ASSIGNMENTS = gql`
  query GetMyAssignments {
    getMyAssignments {
      id
      title
      description
      status
      difficulty
      feedback
      questions {
        type
        prompt
        options
        answer
      }
      responses {
        questionIndex
        answer
      }
      evaluation {
        questionIndex
        isCorrect
        feedback
      }
      totalCorrect
      score
    }
  }
`;


export const GET_FUN_IMAGE = gql`
  query GetFunImage {
    getFunImage {
      imageUrl
      explanation
    }
  }
`;

export const GENERATE_PUZZLE = gql`
  query GeneratePuzzleFromTopic($topic: String!) {
    generatePuzzleFromTopic(topic: $topic) {
      imageUrl
      question
      answer
    }
  }
`;

export const EVALUATE_PUZZLE_ANSWER = gql`
  query EvaluatePuzzleAnswer($question: String!, $userAnswer: String!) {
    evaluatePuzzleAnswer(question: $question, userAnswer: $userAnswer) {
      feedback
    }
  }
`;

export const GET_PARENT_NOTIFICATIONS = gql`
  query GetParentNotifications($limit: Int) {
    getParentNotifications(limit: $limit) {
      message
      date
    }
  }
`;

export const GET_CHILDREN = gql`
  query GetMyChildren {
    getMyChildren {
      id
      name
      age
    }
  }
`;

export const GET_ASSIGNMENTS_FOR_CHILD = gql`
  query GetAssignmentsForChild($childId: ID!) {
    getAssignmentsForChild(childId: $childId) {
      id
      title
      description
      status
      difficulty
      feedback
      questions {
        type
        prompt
        options
        answer
      }
      responses {
        questionIndex
        answer
      }
      evaluation { 
        questionIndex
        isCorrect
        feedback
      }
      totalCorrect 
      score 
      createdAt 
      completedAt 
    }
  }
`;

