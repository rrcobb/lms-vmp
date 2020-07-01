import React from "react";
import { graphql } from "gatsby";
import Content from "../components/Content";

export const query = graphql`
  query(
   $nodeID: String! 
  ) {
    airtableLmsContent(id: { eq: $nodeID }) {
      slug 
      githubSourceUrl
      githubRepositoryName
      githubRepositoryOwner
      childMarkdownRemark {
        frontmatter {
          title
          layout
        }
        html
        timeToRead
      }
    }
  }
`;

const C = (props) => {
  return <Content {...props} />;
};

export default C;
