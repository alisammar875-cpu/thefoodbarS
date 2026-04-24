/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        "bg-dark": "var(--bg-dark)",
        "bg-card": "var(--bg-card)",
        "text-main": "var(--text-main)",
        "text-muted": "var(--text-muted)",
        success: "var(--success)",
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        accent: ['"Syne"', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s linear infinite',
        'mesh': 'mesh 15s ease-in-out infinite alternate',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        mesh: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.2) translate(-20px, 20px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      }
    },
  },
  plugins: [],
}
