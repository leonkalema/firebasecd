const contentful = require('contentful-management');

const contentfulAdminClient = contentful.createClient({
    accessToken: process.env.CONTENTFUL_CONTENT_MANAGEMENT_ACCESS_TOKEN
});

module.exports = contentfulAdminClient;
