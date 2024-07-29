import React, { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { uploadThumbnail, createArticle } from '../utils/shdw';
import { STORAGE_IDENTIFIER } from '../constants';
import { useNavigate } from 'react-router-dom';
// import { FaImage, FaTimesCircle } from 'react-icons/fa'; // アイコンのインポート

const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const wallet = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleCancelThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // ファイル入力要素の値をリセット
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet.publicKey) {
      alert('Wallet not connected');
      return;
    }

    try {
      let thumbnailUrl = '';
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail(wallet, STORAGE_IDENTIFIER, title, thumbnail, connection);
      }

      const article = {
        title,
        content,
        paragraph,
        thumbnail: thumbnailUrl,
        createdAt: new Date().toISOString(),
      };

      const success = await createArticle(wallet, STORAGE_IDENTIFIER, article, connection);
      if (success) {
        navigate('/');
      } else {
        alert('Failed to create article');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Error creating article');
    }
  };

  return (
    <div className="create-article">
      {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail Preview" className='thumbnail' />}
      <form onSubmit={handleSubmit}>
        <div className={`thumbnail-upload ${thumbnailPreview ? 'show-thumbnail' : ''}`}>
          <label htmlFor="thumbnail-upload-button" className="thumbnail-upload-button">
            image
          </label>
          <input 
            id="thumbnail-upload-button"
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleThumbnailChange}
            ref={fileInputRef}
          />
          {thumbnail && (
            <button type="button" className="thumbnail-cancel-button" onClick={handleCancelThumbnail}>
              cancel
            </button>
          )}
        </div>
        <div>
          <input value={title} placeholder='Article title' onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <textarea value={content} placeholder='What will you write about today' onChange={(e) => setContent(e.target.value)} />
        </div>
        <div>
          <textarea value={paragraph} placeholder='Paragraphs for index' onChange={(e) => setParagraph(e.target.value)} />
        </div>
        <button type="submit">Publish</button>
      </form>
    </div>
  );
};

export default CreateArticle;
