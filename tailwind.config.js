/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F1",
        lavender: "#C9B6E8",
        lavenderSoft: "#EFE6F9",
        pink: "#FBD0DE",
        pinkSoft: "#FDEEF3",
        peach: "#FFDCC2",
        peachSoft: "#FFF1E4",
        sky: "#C9E8F2",
        skySoft: "#EAF7FB",
        ink: "#5C4B73",
        inkSoft: "#A893C2",
        gold: "#F0C36B",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Nunito'", "sans-serif"],
        reading: ["'Lora'", "serif"],
      },
      borderRadius: {
        xl2: "22px",
      },
    },
  },
  plugins: [],
};
