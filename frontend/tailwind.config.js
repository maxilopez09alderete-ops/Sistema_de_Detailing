/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#08080a',       // Deep sport luxury black
          card: '#111115',     // Dark slate gray cards
          border: '#1f1f27',   // Premium subtle borders
          input: '#181820',    // Dark inputs
          text: '#f3f4f6',     // Off-white primary text
          muted: '#9ca3af',    // Gray secondary text
        },
        brand: {
          blue: {
            DEFAULT: '#0088ff',
            hover: '#0066cc',
            glow: 'rgba(0, 136, 255, 0.15)',
          },
          orange: {
            DEFAULT: '#ff5500',
            hover: '#cc4400',
            glow: 'rgba(255, 85, 0, 0.15)',
          },
          green: '#10b981',   // Available status color
          red: '#ef4444',     // Busy status color
          yellow: '#f59e0b',  // Pending status color
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'blue-glow': '0 0 20px 0 rgba(0, 136, 255, 0.25)',
        'orange-glow': '0 0 20px 0 rgba(255, 85, 0, 0.25)',
      },
      borderWidth: {
        '0.5': '0.5px',
      }
    },
  },
  plugins: [],
}
