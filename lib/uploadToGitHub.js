import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

const GITHUB_API = 'https://api.github.com';

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;

const MAX_REPO_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB

// Repo isimlerini yönetmek için basit bir text dosyası kullanabiliriz
// (Serverless ortamda kalıcı disk olmadığı için, örnek için basit ve statik isim kullanalım)

async function createRepo(name) {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      private: true,
      description: 'Kalyol Cloud upload repo',
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(`Repo oluşturulamadı: ${json.message}`);
  }

  return await res.json();
}

async function uploadFileToRepo(repoName, file) {
  const content = fs.readFileSync(file.filepath);
  const base64Content = content.toString('base64');

  const apiUrl = `${GITHUB_API}/repos/${username}/${repoName}/contents/${file.originalFilename}`;

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add ${file.originalFilename}`,
      content: base64Content,
      branch: 'main',
    }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(`Dosya yüklenemedi: ${json.message}`);
  }

  return await res.json();
}

export async function uploadToGitHub(files) {
  // Basit repo adı: photos-timestamp
  const repoName = `photos-${Date.now()}`;

  // 1. Repo oluştur
  const repo = await createRepo(repoName);

  // 2. Dosyaları sırayla yükle
  for (const file of files) {
    await uploadFileToRepo(repoName, file);
  }

  return {
    repoUrl: repo.html_url,
  };
}
