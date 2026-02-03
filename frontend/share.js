const apiBase = '/.netlify/functions';

const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');

messageInput.addEventListener('input', () => {
    charCount.textContent = messageInput.value.length;
});

async function submitPost(post) {
    const response = await fetch(`${apiBase}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    });

    if (!response.ok) {
        let details = '';
        try {
            const errorBody = await response.json();
            details = errorBody?.error ? ` (${errorBody.error})` : '';
        } catch (error) {
            details = '';
        }
        throw new Error(`Failed to post message${details}`);
    }

    const data = await response.json();
    return data.post;
}

document.getElementById('messageForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const post = {
        category: document.getElementById('category').value,
        triggerWarning: document.getElementById('triggerWarning').value,
        message: document.getElementById('message').value,
        author: document.getElementById('author').value || 'Anonymous'
    };

    try {
        const createdPost = await submitPost(post);
        event.target.reset();
        charCount.textContent = '0';
        if (createdPost?.id) {
            localStorage.setItem('lastPostId', createdPost.id);
        }
        const redirectId = createdPost?.id ? encodeURIComponent(createdPost.id) : '';
        window.location.href = redirectId ? `./confirm.html?new=${redirectId}` : './confirm.html';
    } catch (error) {
        alert(error.message || 'Unable to post right now. Please try again.');
    }
});
