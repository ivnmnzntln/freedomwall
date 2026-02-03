const { updateStore } = require('./_store');

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return buildResponse(200, { ok: true });
    }

    if (event.httpMethod !== 'POST') {
        return buildResponse(405, { error: 'Method not allowed.' });
    }

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (error) {
        return buildResponse(400, { error: 'Invalid JSON.' });
    }

    const { id } = payload;
    if (!id) {
        return buildResponse(400, { error: 'Post id is required.' });
    }

    let updatedPost = null;
    await updateStore((store) => {
        store.posts = store.posts || [];
        const post = store.posts.find((entry) => entry.id === id);
        if (!post) {
            return;
        }
        post.supports = (post.supports || 0) + 1;
        updatedPost = post;
    });

    if (!updatedPost) {
        return buildResponse(404, { error: 'Post not found.' });
    }

    return buildResponse(200, { post: updatedPost });
};
