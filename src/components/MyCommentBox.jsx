import React from 'react';
import CommentBox from 'react-commentbox';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';

import '../styles/MyCommentBox.css';

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
};

firebase.initializeApp(config);

class MyCommentBox extends React.Component {

    state = { user: null, idToken: null, loading: false };

    componentDidMount() {

        let user = null;
        let idToken = null;

        this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(firebaseUser => {

            if (firebaseUser) {

                this.setState({
                    loading: true
                });

                user = firebaseUser;
                user.getIdToken().then(firebaseIdToken => {

                    idToken = firebaseIdToken;

                    return this.props.contentfulClient.getEntries({
                        'order': 'sys.createdAt',
                        'content_type': 'commentAuthor',
                        'fields.userId': user.uid
                    });

                }).then(response => {

                    if (response.items.length) {
                        const commentAuthor = response.items[0].fields;
                        if (commentAuthor.displayName === user.displayName &&
                            commentAuthor.avatarUrl === user.photoURL) {
                            return user;
                        }

                        return this.props.postData('/.netlify/functions/update-comment-author', { idToken });
                    }

                    return this.props.postData('/.netlify/functions/create-comment-author', { idToken });

                }).then(() => {

                    this.setState({ user, idToken, loading: false });
                }).catch((err) => {
                    console.error(err);
                    this.setState({ loading: false });
                });

            } else {

                this.setState({ user: null, idToken: null });
            }
        });
    }

    componentWillUnmount() {

        this.unregisterAuthObserver();
    }

    // fetch our comments from Contentful
    getComments = () => {

        return this.props.contentfulClient.getEntries({
            'order': 'sys.createdAt', // important for determining nested comments
            'content_type': 'comment',
            'fields.subject': this.props.subjectId,
        }).then( response => {

            return response.items;

        }).catch(console.error);
    };

    // transform Contentful entries to objects that react-commentbox expects.
    normalizeComment = (comment) => {

        const { id, createdAt } = comment.sys;
        const { body, author, parentComment } = comment.fields;

        return {
            id,
            bodyDisplay: body,
            userNameDisplay: author.fields.displayName || 'Unnamed Commenter', // changed
            userAvatarUrl: author.fields.avatarUrl, // changed
            timestampDisplay: createdAt.split('T')[0],
            belongsToAuthor: this.state.user ? (this.state.user.uid === author.fields.userId) : false, // changed
            parentCommentId: parentComment ? parentComment.sys.id : null
        };
    };

    // make an API call to post a comment
    comment = (body, parentCommentId) => {

        this.setState({ loading: true });

        return this.props.postData('/.netlify/functions/create-comment', {
            body,
            parentCommentId,
            subjectId: this.props.subjectId,
            idToken: this.state.idToken // new
        }).then(() => {

            this.setState({ loading: false });
        });
    };

    // will be shown when the comment box is disabled
    disabledComponent = () => {

        if (this.state.loading) {
            return (
                <div>
                    <strong>
                        Please wait...
                    </strong>
                </div>
            );
        }

        return (
            <div>
                <strong>
                    Please login above to comment.
                </strong>
            </div>
        );
    };

    authComponent = () => {

        if (this.state.user) {

            return (
                <div className="logout">
                    <button onClick={this.logout}>
                        <span>
                        {`Logout ${this.state.user.displayName ? this.state.user.displayName : 'Unnamed Commenter'}`}
                        </span>
                    </button>
                </div>
            );
        }

        const uiConfig = {
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.GithubAuthProvider.PROVIDER_ID,
                firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
                signInSuccess: () => false
            }
        };

        return (
            <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        );
    };

    logout = (e) => {
        firebase.auth().signOut();
    };

    render() {

        return (
            <div>

                <this.authComponent />
                <hr />
                <CommentBox
                    usersHaveAvatars={true}
                    disabled={!this.state.user || this.state.loading}
                    getComments={this.getComments}
                    normalizeComment={this.normalizeComment}
                    comment={this.comment}
                    disabledComponent={this.disabledComponent}
                />
            </div>
        );
    }
}

export default MyCommentBox;