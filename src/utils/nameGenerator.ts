export const generateRandomName = () => {
  const adjectives = ["Swift", "Bold", "Clever", "Wise", "Strong"];
  const animals = ["Tiger", "Eagle", "Wolf", "Lion", "Falcon"];
  return adjectives[Math.floor(Math.random() * adjectives.length)] +
         animals[Math.floor(Math.random() * animals.length)];
};

export const getDisplayName = (username?: string) => {
  return username || generateRandomName();
};
