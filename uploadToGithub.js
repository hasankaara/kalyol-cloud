import fetch from 'node-fetch';
import fs from 'fs';

const GITHUB_API = 'https://api.github.com';

async function createRepo(name) {
  const token = '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';

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
    console.error('❌ Repo oluşturma hatası:', json);
    throw new Error(`Repo oluşturulamadı: ${json.message}`);
  }

  return await res.json();
}

async function uploadFileToRepo(repoName, file) {
  const token = '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';
  const username = 'hasankaara';

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
    console.error(`❌ Dosya yükleme hatası (${file.originalFilename}):`, json);
    throw new Error(`Dosya yüklenemedi: ${json.message}`);
  }

  return await res.json();
}

export async function uploadToGitHub(files) {
  try {
    const repoName = `photos-${Date.now()}`;
    console.log('📁 Yeni repo oluşturuluyor:', repoName);

    const repo = await createRepo(repoName);

    for (const file of files) {
      console.log('📤 Dosya yükleniyor:', file.originalFilename);
      await uploadFileToRepo(repoName, file);
    }

    console.log('✅ Tüm dosyalar yüklendi');
    return {
      repoUrl: repo.html_url,
    };
  } catch (err) {
    console.error('🔥 Genel GitHub yükleme hatası:', err);
    throw err;
  }
}
