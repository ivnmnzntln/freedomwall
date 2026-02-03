const { updateStore } = require('./_store');

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
        },
        body: JSON.stringify(body)
    };
}

function isAuthorized(event) {
    const token = process.env.ADMIN_TOKEN;
    if (!token) {
        return false;
    }
    return event.headers['x-admin-token'] === token || event.headers['X-Admin-Token'] === token;
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return buildResponse(200, { ok: true });
    }

    if (event.httpMethod !== 'POST') {
        return buildResponse(405, { error: 'Method not allowed.' });
    }

    if (!isAuthorized(event)) {
        return buildResponse(401, { error: 'Unauthorized.' });
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

    let deleted = false;
    await updateStore((store) => {
        store.posts = store.posts || [];
        const next = store.posts.filter((post) => post.id !== id);
        deleted = next.length !== store.posts.length;
        store.posts = next;
    });

    if (!deleted) {
        return buildResponse(404, { error: 'Post not found.' });
    }

    return buildResponse(200, { ok: true });
};
