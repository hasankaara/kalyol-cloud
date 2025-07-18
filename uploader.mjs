import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;
const email = process.env.GITHUB_EMAIL;
const repoName = `photos-${Date.now()}`;
const localPath = path.resolve(`./output/${repoName}`);
const photosFolder = './your-photos-folder'; // burada klasör yolunu belirt

// 1. Yerel klasör oluştur
fs.mkdirSync(localPath, { recursive: true });

// 2. Fotoğrafları kopyala
fs.readdirSync(photosFolder).forEach(file => {
  fs.copyFileSync(path.join(photosFolder, file), path.join(localPath, file));
});

// 3. Git repo başlat
execSync(`git init`, { cwd: localPath });
execSync(`git config user.name "${username}"`, { cwd: localPath });
execSync(`git config user.email "${email}"`, { cwd: localPath });

// 4. GitHub repo'yu oluştur (gh CLI ile)
execSync(`gh repo create ${username}/${repoName} --private --confirm`, {
  env: {
    ...process.env,
    GITHUB_TOKEN: token
  }
});

// 5. Dosyaları commit + push et
execSync(`git add .`, { cwd: localPath });
execSync(`git commit -m "Add photos"`, { cwd: localPath });
execSync(`git branch -M main`, { cwd: localPath });
execSync(`git remote add origin https://${token}@github.com/${username}/${repoName}.git`, { cwd: localPath });
execSync(`git push -u origin main`, { cwd: localPath });

console.log(`✅ Yüklendi: https://github.com/${username}/${repoName}`);
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;
const email = process.env.GITHUB_EMAIL;
const repoName = `photos-${Date.now()}`;
const localPath = path.resolve(`./output/${repoName}`);
const photosFolder = './your-photos-folder'; // burada klasör yolunu belirt

// 1. Yerel klasör oluştur
fs.mkdirSync(localPath, { recursive: true });

// 2. Fotoğrafları kopyala
fs.readdirSync(photosFolder).forEach(file => {
  fs.copyFileSync(path.join(photosFolder, file), path.join(localPath, file));
});

// 3. Git repo başlat
execSync(`git init`, { cwd: localPath });
execSync(`git config user.name "${username}"`, { cwd: localPath });
execSync(`git config user.email "${email}"`, { cwd: localPath });

// 4. GitHub repo'yu oluştur (gh CLI ile)
execSync(`gh repo create ${username}/${repoName} --private --confirm`, {
  env: {
    ...process.env,
    GITHUB_TOKEN: token
  }
});

// 5. Dosyaları commit + push et
execSync(`git add .`, { cwd: localPath });
execSync(`git commit -m "Add photos"`, { cwd: localPath });
execSync(`git branch -M main`, { cwd: localPath });
execSync(`git remote add origin https://${token}@github.com/${username}/${repoName}.git`, { cwd: localPath });
execSync(`git push -u origin main`, { cwd: localPath });

console.log(`✅ Yüklendi: https://github.com/${username}/${repoName}`);
