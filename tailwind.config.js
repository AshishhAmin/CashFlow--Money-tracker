/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'app-black': '#000000',
                'card-dark': '#121212',
                'neon-green': 'rgb(var(--color-neon-primary) / <alpha-value>)',
                'neon-red': '#E74C3C',
                'brand-purple': '#9B59B6',
                'brand-blue': '#3498DB',
                'brand-yellow': '#F1C40F',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
