/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00f2fe',
                'primary-dark': '#4facfe',
                accent: '#ff0055',
                success: '#00ff9d',
                warning: '#ffbf00',
                'bg-dark': '#0f172a',
                'bg-darker': '#020617',
                'text-primary': '#f8fafc',
                'text-secondary': '#94a3b8',
            },
            fontFamily: {
                main: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
