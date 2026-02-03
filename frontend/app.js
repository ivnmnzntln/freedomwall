const apiBase = '/.netlify/functions';
const supportedKey = 'speakUpSupported';

let posts = [];
let supportedPosts = new Set(JSON.parse(localStorage.getItem(supportedKey)) || []);

const wall = document.getElementById('wall');

function updateStats() {
    document.getElementById('totalPosts').textContent = posts.length;
    const totalSupport = posts.reduce((sum, post) => sum + (post.supports || 0), 0);
    document.getElementById('totalSupport').textContent = totalSupport;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function renderPosts() {
    wall.innerHTML = '';

    if (posts.length === 0) {
        wall.innerHTML = `
            <div class="empty-wall">
                <h3>No posts yet. Be the first to share your voice!</h3>
            </div>
        `;
        updateStats();
        return;
    }

    posts.slice().reverse().forEach((post) => {
        const isSupported = supportedPosts.has(post.id);
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.dataset.postId = post.id;
        postEl.id = `post-${post.id}`;

        let contentHTML = '';
        if (post.triggerWarning) {
            contentHTML = `
                <div class="content-warning" id="warning-${post.id}">
                    <strong>⚠️ Content Warning: ${post.triggerWarning}</strong>
                    <p>This post contains sensitive content. Please proceed with care.</p>
                    <button data-reveal="${post.id}">I Understand, Show Content</button>
                </div>
                <div class="post-content hidden" id="content-${post.id}">${post.message}</div>
            `;
        } else {
            contentHTML = `<div class="post-content">${post.message}</div>`;
        }

        postEl.innerHTML = `
            <span class="post-category">${post.category}</span>
            ${contentHTML}
            <div class="post-meta">
                <span>📝 ${post.author} • ${formatDate(post.timestamp)}</span>
                <div class="support-section">
                    <button class="support-btn ${isSupported ? 'supported' : ''}" data-support="${post.id}" ${isSupported ? 'disabled' : ''}>
                        💜 ${post.supports || 0} Support
                    </button>
                    <button class="resource-btn" data-resource>
                        🆘 Resources
                    </button>
                </div>
            </div>
        `;

        wall.appendChild(postEl);
    });

    updateStats();
}

function focusNewPost() {
    const params = new URLSearchParams(window.location.search);
    const newId = params.get('new') || localStorage.getItem('lastPostId');
    if (!newId) return;

    const target = document.querySelector(`[data-post-id="${newId}"]`);
    if (target) {
        target.classList.add('highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => target.classList.remove('highlight'), 4000);
    }

    localStorage.removeItem('lastPostId');
    if (params.has('new')) {
        params.delete('new');
        const query = params.toString();
        const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        history.replaceState(null, '', nextUrl);
    }
}

async function loadPosts() {
    const response = await fetch(`${apiBase}/posts`);
    const data = await response.json();
    posts = data.posts || [];
    renderPosts();
    focusNewPost();
}

async function supportPost(id) {
    const response = await fetch(`${apiBase}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        throw new Error('Failed to support message.');
    }
}

wall.addEventListener('click', async (event) => {
    const target = event.target;
    if (target.matches('[data-reveal]')) {
        const id = target.getAttribute('data-reveal');
        document.getElementById(`warning-${id}`).style.display = 'none';
        document.getElementById(`content-${id}`).classList.remove('hidden');
        return;
    }

    if (target.matches('[data-support]')) {
        const id = target.getAttribute('data-support');
        if (supportedPosts.has(id)) return;

        try {
            await supportPost(id);
            supportedPosts.add(id);
            localStorage.setItem(supportedKey, JSON.stringify([...supportedPosts]));
            await loadPosts();
        } catch (error) {
            alert('Unable to add support right now. Please try again.');
        }
        return;
    }

    if (target.matches('[data-resource]')) {
        const resources = document.querySelector('.resources');
        window.scrollTo({ top: resources.offsetTop - 20, behavior: 'smooth' });
    }
});

loadPosts();
