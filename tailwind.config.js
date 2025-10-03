/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'base': '0.625rem'
      },
      spacing: {
        '8.5': '2.125rem',
        '15': '3.75rem',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      colors: {
        // Brand Colors
        'brand': '#ff3d00',

        // Button Colors
        'orange': '#ff3d00',
        'white': '#ffffff',
        'on-blue': '#002f64',
        'grey': '#4f4f4f',
        'tab': '#c2c2c2',
        'blue-on': '#0066ff',
        'blue-hover': '#9ec5ff',
        'blue-deactivate': '#e0edff',
        'orange-on': '#ff3d00',
        'orange-hover': '#ff9d7e',
        'orange-deactivate': '#ffe4dc',

        // Background Colors
        'light-orange': '#fff5f2',
        'blue-prime': '#0066ff',
        'light-blue': '#f6fbff',
        'dark-blue': '#002f64',
        'orange-bg': '#ff3d00',
        'faint': '#fafafa',
        'reply': '#eeeeee',

        // Text Colors
        'text-white': '#ffffff',
        'text-grey': '#4f4f4f',
        'text-black': '#000000',
        'text-dark-blue': '#002f64',
        'text-dark-blue50': 'rgba(0, 47, 100, 0.5)',
        'text-light-grey': '#aeadae',

        // Semantic Colors
        'sgreen': '#00b89c',
        'sred': '#f85656',
        'sgrey': '#4b4d52',
      }
    }
  },
  plugins: [],
}

