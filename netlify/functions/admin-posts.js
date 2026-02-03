const { getStore } = require('./_store');

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    if (event.httpMethod !== 'GET') {
        return buildResponse(405, { error: 'Method not allowed.' });
    }

    if (!isAuthorized(event)) {
        return buildResponse(401, { error: 'Unauthorized.' });
    }

    const store = await getStore();
    return buildResponse(200, { posts: store.posts || [] });
};
