/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'app-black': '#050505',
                'card-dark': '#0A0A0A',
                'glass-white': 'rgba(255, 255, 255, 0.05)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'neon-green': 'rgb(var(--color-neon-primary) / <alpha-value>)',
                'neon-red': '#FF4D4D',
                'brand-purple': '#A855F7',
                'brand-blue': '#3B82F6',
                'brand-yellow': '#F59E0B',
                'surface-dark': '#111111',
            },
            fontFamily: {
                sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 15px rgba(var(--color-neon-primary), 0.5)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
