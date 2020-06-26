import React from "react";

const Content = (props) => {
  return (
    <div>
      Some content node
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};

export default Content;
