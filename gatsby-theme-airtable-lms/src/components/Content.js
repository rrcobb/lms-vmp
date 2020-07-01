import React from "react";

const Content = (props) => {
  const { airtableLmsContent } = props.data;
  const { childMarkdownRemark, ...rest } = airtableLmsContent;
  const { frontmatter, html } = childMarkdownRemark;
  const  { title, layout } = frontmatter;
  console.log(layout)
  return (
    <div>
      <h1>{title}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <pre>{JSON.stringify(rest, null, 2)}</pre>
    </div>
  );
};

export default Content;
