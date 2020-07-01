module.exports = ({ airtableApiKey, airtableBaseId, githubApiKey }) => ({
  plugins: [
    // {
    // resolve: `gatsby-source-graphql`,
    // options: {
    //  typeName: "Github",
    //   fieldName: "github",
    //   url: "https://api.github.com/graphql",
    //   headers: {
    //      Authorization: `Bearer ${githubApiKey}`,
    //    },
    //  },
    // },
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: airtableApiKey,
        tables: [
          {
            baseId: airtableBaseId,
            tableName: `Courses`,
            tableView: `Deploy`, // optional
            tableLinks: [`Modules`], // optional, for deep linking to records across tables.
          },
          {
            baseId: airtableBaseId,
            tableName: `Modules`,
            tableLinks: [`Objectives`, `Content`, `Course`],
          },
          {
            baseId: airtableBaseId,
            tableName: `Content`,
            tableView: `By Module`,
            tableLinks: [`Objectives`, `Modules`],
          },
          {
            baseId: airtableBaseId,
            tableName: `Objectives`,
            tableLinks: [`Modules`, `Content`],
          },
        ],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
    },
  ],
})
