export const generateRandomName = () => {
  const adjectives = ["Swift", "Bold", "Clever", "Wise", "Strong"];
  const animals = ["Tiger", "Eagle", "Wolf", "Lion", "Falcon"];
  return adjectives[Math.floor(Math.random() * adjectives.length)] +
         animals[Math.floor(Math.random() * animals.length)];
};

export const getDisplayName = (username?: string, shortened?: boolean) => {
  if (username) {
    return shortened && username.length > 12 ? username.substring(0, 12) + '...' : username;
  }
  return generateRandomName();
};
