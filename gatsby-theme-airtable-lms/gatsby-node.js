// TODO: create the gatsby graphql schema for the lms
// merge the third party schema with our own
// courses, modules, content
exports.sourceNodes = ({ actions }) => {
  actions.createTypes(`
  type Airtable implements Node {
    slug: String
    githubObjectExpression: String
    githubRepositoryName: String,
    githubRepositoryOwner: String,
  }
  `);
};

exports.createResolvers = ({ createResolvers, reporter }, options) => {
  const slugify = (str) =>
    str &&
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  // From a path like:
  // https://github.com/rrcobb/su-content/blob/master/wdp-vancouver/_lessons/week-01/03b-web-fonts.md
  // To a object expression like:
  // master:adp-vancouver/_slides/week-07/01-intro-to-tdd.md
  const re = /https:\/\/github.com\/(?<author>[\w-]+)\/(?<repo>[\w-]+)\/blob\/(?<branch>\w+)\/(?<path>.+)/;

  const objExpr = (url) => {
    if (url) {
      let { author, branch, repo, path } = url.match(re).groups;
      return `${branch}:${path}`;
    }
  };

  const repoName = (url) => {
    if (url) {
      let { author, branch, repo, path } = url.match(re).groups;
      return repo;
    }
  };

  const owner = (url) => {
    if (url) {
      let { author, branch, repo, path } = url.match(re).groups;
      return author;
    }
  };

  createResolvers({
    Airtable: {
      slug: {
        resolve: (source) => slugify(source.data.Name),
      },
      githubObjectExpression: {
        resolve: (source) => objExpr(source.data.View_on_Github),
      },
      githubRepositoryName: {
        resolve: (source) => repoName(source.data.View_on_Github),
      },
      githubRepositoryOwner: {
        resolve: (source) => owner(source.data.View_on_Github),
      },
    },
  });
};

//
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
          slug
          githubObjectExpression
          githubRepositoryName
          githubRepositoryOwner
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
    if (
      node.slug &&
      node.githubObjectExpression &&
      node.githubRepositoryName &&
      node.githubRepositoryOwner
    ) {
      actions.createPage({
        path: `/${node.slug}`,
        component: require.resolve("./src/templates/content.js"),
        context: {
          nodeID: node.id,
          githubObjectExpression: node.githubObjectExpression,
          githubRepositoryName: node.githubRepositoryName,
          githubRepositoryOwner: node.githubRepositoryOwner,
        },
      });
    }
  });
};
