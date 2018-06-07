const client = require('./contentfulAdminClient');
const admin = require('./firebaseAdmin');

module.exports = function getAuthor(idToken) {

    let environment = null;
    let authorId = null;

    return admin.auth().verifyIdToken(idToken)
        .then(({ uid }) => {

            authorId = uid;
            return client.getSpace(process.env.GATSBY_CONTENTFUL_SPACE_ID);
        })
        .then(space => space.getEnvironment('master'))
        .then(_environment => {

            environment = _environment;

            return environment.getEntries({
                'order': 'sys.createdAt',
                'content_type': 'commentAuthor',
                'fields.blocked[ne]': true,
                'fields.userId': authorId
            });
        })
        .then(entries => {

            if (entries.items.length === 0) {
                throw new Error('Author not found.');
            }
            return {  environment, author: entries.items[0] };
        });

};
