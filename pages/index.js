import React, { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Lütfen en az bir dosya seç!");
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', files[0]); // Şimdilik sadece ilk dosyayı alıyoruz

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Dosya başarıyla yüklendi!');
      } else {
        setMessage('❌ Yükleme sırasında bir hata oluştu: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Yükleme başarısız.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6">Kalyol Cloud 💾</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-4 text-sm text-white file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0 file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Yükleniyor...' : 'Dosya Yükle'}
      </button>

      {message && <p className="mt-4">{message}</p>}

      {files.length > 0 && (
        <div className="mt-6">
          <p className="font-semibold">Seçilen Dosyalar:</p>
          <ul className="list-disc pl-5">
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
