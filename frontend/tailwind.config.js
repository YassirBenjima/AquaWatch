/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-dark': 'var(--color-primary-dark)',
                accent: 'var(--color-accent)',
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                'bg-dark': 'var(--bg-card)', // Semantic Mapping
                'bg-darker': 'var(--bg-main)', // Semantic Mapping
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
            },
            fontFamily: {
                main: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
