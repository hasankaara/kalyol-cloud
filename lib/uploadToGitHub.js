import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const GITHUB_API = 'https://api.github.com';

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;

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
  const content = fs.readFileSync(file.filepath);  // tmp'den okunuyor artık
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
  const repoName = `photos-${Date.now()}`;

  const repo = await createRepo(repoName);

  for (const file of files) {
    await uploadFileToRepo(repoName, file);
  }

  return {
    repoUrl: repo.html_url,
  };
}
