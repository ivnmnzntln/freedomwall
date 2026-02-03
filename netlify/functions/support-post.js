const { updateStore } = require('./_store');

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store',
            'CDN-Cache-Control': 'no-store'
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
    let knownIds = [];
    try {
        await updateStore((store) => {
            store.posts = store.posts || [];
            knownIds = store.posts.map((entry) => entry.id).slice(0, 5);
            const post = store.posts.find((entry) => String(entry.id) === String(id));
            if (!post) {
                return;
            }
            post.supports = (post.supports || 0) + 1;
            updatedPost = post;
        });
    } catch (error) {
        return buildResponse(500, { error: 'Storage update failed.' });
    }

    if (!updatedPost) {
        return buildResponse(404, {
            error: 'Post not found.',
            count: knownIds.length,
            sampleIds: knownIds
        });
    }

    return buildResponse(200, { post: updatedPost });
};
