// create the gatsby graphql schema for the lms
// courses, modules, content
// exports.sourceNodes = () => {};

// do the page creation part of the lms sourcing
exports.createPages = async ({ actions, graphql, reporter }) => {
  actions.createPage({
    path: "/home",
    component: require.resolve("./src/templates/home.js"),
  });
  const result = await graphql(`
    query {
      allAirtable(filter: { table: { eq: "Content" } }) {
        nodes {
          id
        }
      }
    }
  `);
  if (result.errors) {
    reporter.panic("error fetching airtable records", result.errors);
    return;
  }
  const content = result.data.allAirtable.nodes;
  content.forEach((node) => {
    reporter.info(`node id: ${node.id}`);
    actions.createPage({
      path: `/atnodes/${node.id}`,
      component: require.resolve("./src/templates/content.js"),
      context: {
        nodeID: `${node.id}`,
      },
    });
  });
};
