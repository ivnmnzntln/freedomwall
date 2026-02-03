const params = new URLSearchParams(window.location.search);
const newId = params.get('new') || localStorage.getItem('lastPostId');

setTimeout(() => {
    if (newId) {
        window.location.href = `./index.html?new=${encodeURIComponent(newId)}`;
    } else {
        window.location.href = './index.html';
    }
}, 1800);
