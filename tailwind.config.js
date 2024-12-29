/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        main: '#cd3232',
        text: '#f9f9f9',
        button: '#f9f9f9',
        buttonHover: '#dc635b',
      },
      scrollbar: ['rounded'],
    },
  },
  plugins: [],
};
