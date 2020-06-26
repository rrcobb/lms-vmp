import React from "react";
import { graphql } from "gatsby";
import Content from "../components/Content";

// some page query here
export const query = graphql`
  query($nodeID: String!) {
    airtable(id: { eq: $nodeID }) {
      data {
        Content_URL_Prefix
        Name
        Path
        Type
        View_on_Github
      }
    }
  }
`;

const C = (props) => {
  return <Content {...props} />;
};

export default C;
