exports.onPreBootstrap = (_, {airtableApiKey, githubApiKey}) => {
  if (!airtableApiKey) {
    throw new Error("Airtable LMS needs a valid Airtable API key");
  }
  if (!githubApiKey) {
    throw new Error("Airtable LMS needs a valid Github API key");
  }
}
// creates the gatsby graphql schema parts for our nodes
// just 'lms content' right now
exports.createSchemaCustomization = ({ actions }) => {
  // Create the type for an 'AirtableLMSContent'
  actions.createTypes(`
  type AirtableLmsContent implements Node @infer {
    id: ID!
    slug: String
    githubSourceUrl: String
    githubRepositoryName: String
    githubRepositoryOwner: String
    githubObjectExpression: String
    content: String
  }
  `);
};
//
// From a path like:
  // https://github.com/rrcobb/su-content/blob/master/wdp-vancouver/_lessons/week-01/03b-web-fonts.md
  // To a object expression like:
  // master:adp-vancouver/_slides/week-07/01-intro-to-tdd.md
const re = /https:\/\/github.com\/(?<author>[\w-]+)\/(?<repo>[\w-]+)\/blob\/(?<branch>\w+)\/(?<path>.+)/;

const slugify = (str) =>
  str &&
    str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const transformDataFromAirtableNode = (airtableNode) => {
  let { author, branch, repo, path } = airtableNode.data.View_on_Github.match(re).groups;
   return {
      id: `${airtableNode.id}-content`,
      slug: slugify(airtableNode.data.Name),
      githubObjectExpression: `${branch}:${path}`,
      githubSourceUrl: airtableNode.data.View_on_Github,
      githubRepositoryName: repo,
      githubRepositoryOwner: author,
    };
}

// gatsby calls this when it's the plugin's turn to create nodes
// we want to create nodes for LMS Content
// And fill them with the markdown content from github
exports.sourceNodes = async ({actions, getNodesByType, reporter, createContentDigest, createNodeId }) => {
  const { createNode } = actions; 
  const allAirtableNodes = getNodesByType("Airtable")
  const content = allAirtableNodes.filter(node => node.table === "Content")
  content.forEach((airtableNode) => {
    reporter.info(`making an airtable lms content node: ${airtableNode.data.Name}`)
    createNode({
      id: createNodeId(`LMS-Content-${airtableNode.id}`),
      internal: {
        type: `AirtableLmsContent`,
        contentDigest: createContentDigest(airtableNode.internal.contentDigest)
      },
      ...transformDataFromAirtableNode(airtableNode),
    })
    
    // graphql query for github repo
    // github {
    //   repository(name: $githubRepositoryName, owner: $githubRepositoryOwner) {
    //     object(expression: $githubObjectExpression) {
    //       ... on Github_Blob {
    //         id
    //         text
    //       }
    //     }
    //   }
    // }   
    // const textNode = {
    //   internal: {
    //     type: `AirtableLMSContentMarkdownBody`,
    //     mediaType: "text/markdown",
    //     content: node.body,
    //     contentDigest: digest(node.body),
    //   }
    // }
  })
}

//
// do the page creation part of the lms sourcing
exports.createPages = async ({ actions, graphql, reporter }) => {
  actions.createPage({
    path: "/home",
    component: require.resolve("./src/templates/home.js"),
  });

  const result = await graphql(`
    query {
      allAirtableLmsContent {
        nodes {
          id
          slug
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic("error generating pages from lms content nodes", result.errors);
    return;
  }

  const contentNodes = result.data.allAirtableLmsContent.nodes
  const contentComponent = require.resolve("./src/templates/content.js")

  contentNodes.forEach((node) => {
    actions.createPage({
      path: `/${node.slug}`,
      component: contentComponent,
      context: {
        nodeID: node.id,
      },
    });   
  });
};
