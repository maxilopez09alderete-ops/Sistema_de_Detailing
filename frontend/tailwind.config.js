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
          bg: '#0a0a0c',       // Sober obsidian black
          card: '#121215',     // Elegant deep charcoal
          border: '#202026',   // Premium subtle gray borders
          input: '#16161b',    // Dark inputs
          text: '#f4f4f5',     // Off-white primary text (zinc-100)
          muted: '#a1a1aa',    // Gray secondary text (zinc-400)
        },
        brand: {
          blue: {
            DEFAULT: '#e4e4e7', // Matte Silver / Zinc-300 for main actions
            hover: '#d4d4d8',   // Slightly darker silver for hover
            glow: 'rgba(255, 255, 255, 0.03)',
          },
          orange: {
            DEFAULT: '#c5a880', // Elegant Champagne Gold for high-end accent
            hover: '#b0946c',   // Darker champagne for hover
            glow: 'rgba(197, 168, 128, 0.03)',
          },
          green: '#6ee7b7',     // Soft desaturated sage green
          red: '#fca5a5',       // Soft desaturated rose red
          yellow: '#fde047',    // Soft desaturated amber yellow
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
