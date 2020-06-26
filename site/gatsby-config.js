module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-airtable-lms`,
      options: {
        // basePath
        airtableApiKey: process.env.AIRTABLE_API_KEY,
        airtableBaseId: "appXVVr7HrxcA0jvB",
        githubApiKey: process.env.GITHUB_API_TOKEN,
      },
    },
  ],
};
