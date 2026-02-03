const themeToggle = document.querySelector('[data-theme-toggle]');
const storageKey = 'speakup-theme';

function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        themeToggle.setAttribute('aria-pressed', theme === 'dark');
    }
}

const storedTheme = sessionStorage.getItem(storageKey);
const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(initialTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
        sessionStorage.setItem(storageKey, nextTheme);
        applyTheme(nextTheme);
    });
}
