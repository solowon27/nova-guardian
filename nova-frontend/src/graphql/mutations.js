import { gql } from '@apollo/client';

export const UPDATE_ASSIGNMENT_STATUS = gql`
  mutation UpdateAssignmentStatus($assignmentId: ID!, $status: String!, $responses: [ResponseInput]) {
    updateAssignmentStatus(assignmentId: $assignmentId, status: $status, responses: $responses) {
      id
      status
      responses {
        questionIndex
        answer
      }
    }
  }
`;

export const UPDATE_CHILD_XP = gql`
  mutation UpdateChildXP($childId: ID!, $xp: Int!) {
    updateChildXP(childId: $childId, xp: $xp) {
      xp
      badges
    }
  }
`;

export const ADD_CHILD_BADGE = gql`
  mutation AddChildBadge($childId: ID!, $badge: String!) {
    addChildBadge(childId: $childId, badge: $badge) {
      badges
    }
  }
`;


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
    }
  }
`;

export const UPDATE_ASSIGNMENT_FEEDBACK = gql`
  mutation UpdateAssignmentFeedback($assignmentId: ID!, $feedback: String!) {
    updateAssignmentFeedback(assignmentId: $assignmentId, feedback: $feedback) {
      id
      feedback
    }
  }
`;
