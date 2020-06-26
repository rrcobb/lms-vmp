import React from "react";
import { graphql } from "gatsby";
import Content from "../components/Content";

// some page query here
export const query = graphql`
  query(
    $nodeID: String!
    $githubObjectExpression: String!
    $githubRepositoryName: String!
    $githubRepositoryOwner: String!
  ) {
    airtable(id: { eq: $nodeID }) {
      data {
        Content_URL_Prefix
        Name
        Path
        Type
        View_on_Github
      }
    }
    github {
      repository(name: $githubRepositoryName, owner: $githubRepositoryOwner) {
        object(expression: $githubObjectExpression) {
          ... on Github_Blob {
            id
            text
          }
        }
      }
    }
  }
`;

const C = (props) => {
  return <Content {...props} />;
};

export default C;
