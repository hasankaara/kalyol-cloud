import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { uploadToGitHub } from '../../lib/uploadToGitHub';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_SIZE_BYTES = 3 * 1024 * 1024 * 1024; // 3 GB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST destekleniyor' });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    // ...gerisi aynı
  });
}

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse hatası:', err);
      return res.status(500).json({ error: 'Form parse hatası' });
    }

    let uploadedFiles = [];
    if (Array.isArray(files.file)) {
      uploadedFiles = files.file;
    } else if (files.file) {
      uploadedFiles = [files.file];
    } else {
      return res.status(400).json({ error: 'Dosya alınamadı' });
    }

    const totalSize = uploadedFiles.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: 'Toplam dosya boyutu 3 GB’ı aşamaz' });
    }

    try {
      // Dosyaları tmp'ye taşıyoruz
      const filesWithTmpPaths = await Promise.all(
        uploadedFiles.map(async (file) => {
          const tmpPath = path.join('/tmp', file.originalFilename);
          await fs.copyFile(file.filepath, tmpPath);
          return {
            ...file,
            filepath: tmpPath, // önemli: filepath'i tmp'ye güncelledik
          };
        })
      );

      const result = await uploadToGitHub(filesWithTmpPaths);

      return res.status(200).json({ success: true, repoUrl: result.repoUrl });
    } catch (e) {
      console.error('GitHub yükleme hatası:', e);
      return res.status(500).json({ error: 'GitHub yükleme başarısız' });
    }
  });
}
