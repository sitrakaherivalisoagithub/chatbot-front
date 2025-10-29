/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // AJOUTEZ CETTE PARTIE
  safelist: [
    {
      // Force toutes les couleurs de fond de la palette 500
      pattern: /bg-(red|green|blue|amber|yellow|purple|teal)-(500)/,
    },
    {
      // Force toutes les couleurs de texte de la palette 400 et 600
      pattern: /text-(red|green|blue|amber|yellow|purple|teal)-(400|600)/,
    },
    {
      // Force les classes pour les hauteurs et largeurs de graphiques
      pattern: /(w|h)-(3|5|6|12|16|20|24|32)/,
    },
    {
      // Force les classes pour les graphiques SVG
      pattern: /stroke-(gray|blue|green|red|amber|yellow|purple|teal)-(200|500|700)/,
    }
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
