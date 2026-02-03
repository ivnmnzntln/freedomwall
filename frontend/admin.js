const apiBase = '/.netlify/functions';
const tokenKey = 'speakup-admin-token';

const tokenInput = document.getElementById('adminToken');
const saveTokenButton = document.getElementById('saveToken');
const statusEl = document.getElementById('adminStatus');
const refreshButton = document.getElementById('refreshPosts');
const tableEl = document.getElementById('adminTable');

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#ef4444' : '';
}

function getToken() {
    return sessionStorage.getItem(tokenKey) || '';
}

function setToken(token) {
    sessionStorage.setItem(tokenKey, token);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

async function fetchPosts() {
    const response = await fetch(`${apiBase}/admin-posts`, {
        headers: {
            'X-Admin-Token': getToken()
        }
    });

    if (!response.ok) {
        throw new Error('Unauthorized or failed to load posts.');
    }

    const data = await response.json();
    return data.posts || [];
}

async function deletePost(id) {
    const response = await fetch(`${apiBase}/admin-delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': getToken()
        },
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        throw new Error('Failed to delete post.');
    }
}

function renderPosts(posts) {
    if (!posts.length) {
        tableEl.innerHTML = '<div class="empty-wall">No posts available.</div>';
        return;
    }

    tableEl.innerHTML = posts
        .slice()
        .reverse()
        .map((post) => {
            const warning = post.triggerWarning ? `<span class="admin-tag">⚠️ ${post.triggerWarning}</span>` : '';
            return `
                <div class="admin-row">
                    <div class="admin-cell admin-meta">
                        <strong>${post.category}</strong>
                        ${warning}
                        <span class="admin-sub">${post.author} • ${formatDate(post.timestamp)}</span>
                    </div>
                    <div class="admin-cell admin-content">${post.message}</div>
                    <div class="admin-cell admin-actions">
                        <button class="support-btn" data-delete="${post.id}">Delete</button>
                        <span class="admin-support">💜 ${post.supports || 0}</span>
                    </div>
                </div>
            `;
        })
        .join('');
}

async function loadPosts() {
    try {
        const posts = await fetchPosts();
        renderPosts(posts);
        setStatus(`Loaded ${posts.length} posts.`);
    } catch (error) {
        setStatus(error.message, true);
    }
}

saveTokenButton.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (!token) {
        setStatus('Please enter a token.', true);
        return;
    }
    setToken(token);
    tokenInput.value = '';
    setStatus('Token saved for this session.');
    loadPosts();
});

refreshButton.addEventListener('click', () => {
    loadPosts();
});

tableEl.addEventListener('click', async (event) => {
    const target = event.target;
    if (!target.matches('[data-delete]')) return;
    const id = target.getAttribute('data-delete');
    if (!id) return;

    const confirmed = window.confirm('Delete this post? This cannot be undone.');
    if (!confirmed) return;

    try {
        await deletePost(id);
        await loadPosts();
        setStatus('Post deleted.');
    } catch (error) {
        setStatus(error.message, true);
    }
});

const storedToken = getToken();
if (storedToken) {
    loadPosts();
}
