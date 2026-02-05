const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, '..', 'app', 'api', 'auth', '[...nextauth]');
const routeFile = path.join(authDir, 'route.ts');
const routeContent = `export { GET, POST } from "@/lib/auth";
`;

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
  console.log('Created [...nextauth] folder');
}

if (!fs.existsSync(routeFile)) {
  fs.writeFileSync(routeFile, routeContent);
  console.log('Created route.ts');
}

console.log('Setup complete!');
