# Gatsby Theme Airtable LMS

A theme for connecting your airtable lms (see the template) to your gatsby site.

Getting started:

- install the theme
- add the theme to your plugins array in gatsby-config.js
- configure the theme with your airtable info

## How's it work?

- fetches your course from airtable
- fetches the _modules_ from your course from airtable
- fetches the _content_ from your modules from airtable
- based on the type of each piece of content, fetches the content itself
- generates pages for your content, with the metadata from airtable

## Changing what gets displayed

First, check out the gatsby docs on _Shadowing_ themes. That's how you change what gets displayed.

The theme uses ThemeUI, so you can override it as described by the gatsby docs and examples.

You can configure the style by merging an object with theme configuration in theme-ui/index or whatever

If you want to change what content is displayed on the page, override the display components, as described in the shadowing docs. 

The display components are:

- Content

## Done

- Take in a config object from the site
- Fetch the data from Airtable and pass it downstream
- make a content pages from the each airtable content row


## TODO

- pull graphql sourced github data into pages 
- Add the github fetcher (using github's api and gatsby-source-graphql to stitch together the graphql apis) and add support for the reading-md type
    https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-graphql

- add links to modules and content to the homepage
- add module page
- Add to the graphql schema
- Add support for the slides-md type
- make the airtable base a template

Starting with one site = one course, but TODO make site configurable to multiple courses

- speed things up with the gatsby cache, per https://www.gatsbyjs.org/docs/creating-a-source-plugin/ and https://www.gatsbyjs.org/docs/build-caching

Graphql API design
- (ignoring for now, since source-airtable takes care of a lot)
