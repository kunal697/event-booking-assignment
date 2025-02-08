/** @type {import('tailwindcss').Config} */
export default {
   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
   theme: {
      extend: {
         colors: {
            primary: {
               DEFAULT: '#4F46E5',
               dark: '#3730A3',
               light: '#E0E7FF',
            },
            secondary: {
               DEFAULT: '#10B981',
               dark: '#059669',
               light: '#D1FAE5',
            },
            background: '#F9FAFB',
            surface: '#FFFFFF',
         },
         boxShadow: {
            card: '0 2px 4px rgba(0, 0, 0, 0.1)',
            'card-hover': '0 12px 24px rgba(0, 0, 0, 0.15)',
         },
      },
   },
   plugins: [],
};
