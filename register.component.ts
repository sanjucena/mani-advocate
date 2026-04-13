// INTERVIEW TIP: "Environment files let you swap config between
// dev and production. Angular's build system replaces the file
// at build time based on the --configuration flag."

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
};
