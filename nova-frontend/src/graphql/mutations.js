import { gql } from '@apollo/client';

// 1. User/Authentication Mutations
export const REGISTER_PARENT = gql`
  mutation RegisterParent($email: String!, $password: String!) {
    registerParent(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $username: String,  $password: String!) {
    login(email: $email, username: $username, password: $password) {
      token
      user {
        id
        name
        email
        username
        role
      }
    }
  }
`;

// 2. Child Profile Mutations
export const CREATE_CHILD_PROFILE = gql`
  mutation CreateChildProfile($name: String!, $age: Int!, $username: String!, $password: String!) {
    createChildProfile(name: $name, age: $age, username: $username, password: $password) {
      id
      name
      age
      username
      xp
      badges
      parent # Assuming you might want to know the parent's ID
    }
  }
`;
// 3. Assignment Management Mutations

export const CREATE_ASSIGNMENT = gql`
  mutation CreateAssignment(
    $childId: ID!
    $title: String!
    $description: String!
    $questions: [QuestionInput!]!
    $difficulty: Difficulty!
  ) {
    createAssignment(
      childId: $childId
      title: $title
      description: $description
      questions: $questions
      difficulty: $difficulty
    ) {
      id
      title
      description
      status
      difficulty
      questions {
        type
        prompt
        options
        answer
      }
      responses { # Include responses if they might be initialized empty or needed
        questionIndex
        answer
      }
      evaluation { # Include evaluation if it might be initialized empty or needed
        questionIndex
        isCorrect
        feedback
      }
      totalCorrect # Include for initial state
      score        # Include for initial state
      createdAt
      completedAt
    }
  }
`;

export const UPDATE_ASSIGNMENT_STATUS = gql`
  mutation UpdateAssignmentStatus($assignmentId: ID!, $status: String!, $responses: [ResponseInput]) {
    updateAssignmentStatus(assignmentId: $assignmentId, status: $status, responses: $responses) {
      id
      status
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
      completedAt  
    }
  }
`;

export const UPDATE_ASSIGNMENT_FEEDBACK = gql`
  mutation UpdateAssignmentFeedback($assignmentId: ID!, $feedback: String!) {
    updateAssignmentFeedback(assignmentId: $assignmentId, feedback: $feedback) {
      id
      title         
      description
      status
      difficulty
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
      feedback     
      createdAt
      completedAt
    }
  }
`;

export const EVALUATE_ASSIGNMENT_RESPONSE = gql`
  mutation EvaluateAssignmentResponse(
    $childId: ID!
    $assignmentId: ID!
    $evaluation: [AnswerEvaluationInput!]!
  ) {
    evaluateAssignmentResponse(
      childId: $childId
      assignmentId: $assignmentId
      evaluation: $evaluation
    ) {
      assignmentId: assignmentId
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

// 4. Child XP & Badge Mutations
export const UPDATE_CHILD_XP = gql`
  mutation UpdateChildXP($childId: ID!, $xp: Int!) {
    updateChildXP(childId: $childId, xp: $xp) {
      id # The child's ID is useful for cache updates
      xp
      badges
    }
  }
`;

export const ADD_CHILD_BADGE = gql`
  mutation AddChildBadge($childId: ID!, $badge: String!) {
    addChildBadge(childId: $childId, badge: $badge) {
      id # The child's ID is useful for cache updates
      badges
    }
  }
`;

// 5. Trivia Score
export const SAVE_TRIVIA_SCORE = gql`
  mutation SaveTriviaScore($childId: ID!, $score: Int!) {
    saveTriviaScore(childId: $childId, score: $score) {
      id
      childId
      score
      date
    }
  }
`;