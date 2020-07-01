const GraphQLClient = require('graphql-request').GraphQLClient;

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
const buildQuery = ({githubRepositoryName, githubRepositoryOwner, githubObjectExpression}) => {
  return `
  query {
      repository(name: "${githubRepositoryName}", owner: "${githubRepositoryOwner}") {
        object(expression: "${githubObjectExpression}") {
          ... on Blob {
            id
            text
          }
        }
      }
    }
  `
}

exports.sourceNodes = async ({actions, getNodesByType, reporter, createContentDigest, createNodeId }, {githubApiKey}) => {
  const allAirtableNodes = getNodesByType("Airtable")
  const content = allAirtableNodes.filter(node => node.table === "Content")
  const contentQueries = content.map((airtableNode) => {
    const data = transformDataFromAirtableNode(airtableNode);
    return {
      data,
      query: buildQuery(data)
    }
  })

  // setup for fetching straight from github api
  const apiUrl = "https://api.github.com/graphql"
  const headers = {
    Authorization: `Bearer ${githubApiKey}`,
  }
  const client = new GraphQLClient(apiUrl, {
    headers,
  });

  const responses = await Promise.all(
    contentQueries
    .map(({data, query}) => 
      client.request(query).then(res => ({data, ...res}))
    ))

  responses.forEach(({data, ...response}) => {
    // reporter.info(`github response: ${JSON.stringify(response)}`)
    // reporter.info(`airtable data: ${JSON.stringify(data)}`)
    actions.createNode({
      id: createNodeId(`LMS-Content-${data.id}`),
      internal: {
        type: `AirtableLmsContent`,
        contentDigest: createContentDigest(data.id),
        mediaType: 'text/markdown',
        content: response.repository.object.text
      },
      ...data,
    })
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
