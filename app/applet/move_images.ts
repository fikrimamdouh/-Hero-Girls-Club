import fs from 'fs';
import path from 'path';

const rootDir = '/app/applet';
const publicGamesDir = path.join(rootDir, 'public', 'games');

if (!fs.existsSync(publicGamesDir)) {
  fs.mkdirSync(publicGamesDir, { recursive: true });
}

const files = fs.readdirSync(rootDir);
const imageExtensions = ['.png', '.jpg', '.jpeg', '.jfif', '.gif', '.svg'];

files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (imageExtensions.includes(ext)) {
    const oldPath = path.join(rootDir, file);
    const newPath = path.join(publicGamesDir, file);
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${file} to public/games/`);
  }
});
