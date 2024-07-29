import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ShdwDrive } from '@shadow-drive/sdk';
import { createStorage, getStorageAccount, saveSettings, getFileContent } from '../utils/shdw';
import { STORAGE_IDENTIFIER } from '../constants';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const [size, setSize] = useState('10MB');
  const [blogName, setBlogName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorIcon, setAuthorIcon] = useState<File | null>(null);
  const [authorIconUrl, setAuthorIconUrl] = useState<string | null>(null);
  const wallet = useWallet();
  const { connection } = useConnection();
  const [storageExists, setStorageExists] = useState(false);
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStorage = async () => {
      const storageAccount = await getStorageAccount(wallet, STORAGE_IDENTIFIER, connection);
        setStorageExists(!!storageAccount);

        if (storageAccount) {
          try {
            const settingsContent = await getFileContent(storageAccount.publicKey, 'index.json');
            if (settingsContent) {
              const settingsData = JSON.parse(settingsContent);
              const settings = settingsData.settings || {};
              setBlogName(settings.blogName || '');
              setAuthorName(settings.authorName || '');
              if (settings.authorIcon) {
                const fullIconUrl = `https://shdw-drive.genesysgo.net/${storageAccount.publicKey.toString()}/${settings.authorIcon}`;
                setAuthorIconUrl(`${fullIconUrl}?c=${Date.now()}`);
              }
            }
          } catch (error) {
            console.error('Error fetching settings:', error);
          }
      }
    };
    checkStorage();
  }, [wallet, connection]);

  const handleCreateStorage = async () => {
    await createStorage(wallet, STORAGE_IDENTIFIER, size, connection);
    setStorageExists(true);
  };

  const handleCreateArticle = () => {
    navigate('/create-article');
  };

  const handleSaveSettings = async () => {
    const settings = {
      blogName,
      authorName,
      authorIcon: 'authorIcon.png',
    };

    if (authorIcon) {
      try {
        const storageAccount = await getStorageAccount(wallet, STORAGE_IDENTIFIER, connection);
        if (!storageAccount) throw new Error('Storage account not found');

        const drive = await new ShdwDrive(connection, wallet).init();
        const extension = authorIcon.name.split('.').pop();
        const iconFileName = `authorIcon.${extension}`;
        const iconFile = new File([authorIcon], iconFileName, { type: authorIcon.type });

        const iconUrl = `https://shdw-drive.genesysgo.net/${storageAccount.publicKey.toString()}/${iconFileName}`;
        const response = await fetch(iconUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('File exists, updating...');
          await drive.editFile(storageAccount.publicKey, iconUrl, iconFile, 'v2');
        } else if (response.status === 404) {
          console.log('File does not exist, uploading...');
          await drive.uploadFile(storageAccount.publicKey, iconFile);
        } else {
          throw new Error(`Failed to check file existence: ${response.statusText}`);
        }

        settings.authorIcon = iconFileName;
        setAuthorIconUrl(`${iconUrl}?c=${Date.now()}`);
        console.log('Icon uploaded successfully:', iconUrl);
      } catch (error) {
        console.error('Error uploading icon:', error);
      }
    }

    await saveSettings(wallet, settings, connection);

    setNotification('保存が完了しました');
  };

  return (
    <div className="settings-container">
      {storageExists ? (
        <div>
          <p>Storage account "{STORAGE_IDENTIFIER}" already exists.</p>
          <div>
            <label>Blog Name</label>
            <input value={blogName} onChange={(e) => setBlogName(e.target.value)} />
          </div>
          <div>
            <label>Author Name</label>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
          </div>
          <div>
            <label>Author Icon</label>
            {authorIconUrl ? <img src={authorIconUrl} alt="Author Icon" style={{ width: '100px', height: '100px' }} /> : null}
            <input type="file" onChange={(e) => setAuthorIcon(e.target.files ? e.target.files[0] : null)} />
          </div>
          <button onClick={handleSaveSettings}>Save Settings</button>
          {notification && <p>{notification}</p>}
          <button onClick={handleCreateArticle}>Create New Article</button>
        </div>
      ) : (
        <div>
          <label>Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="10MB">10MB</option>
            <option value="100MB">100MB</option>
            <option value="1GB">1GB</option>
          </select>
          <button onClick={handleCreateStorage}>Create Storage</button>
        </div>
      )}
    </div>
  );
};

export default Settings;
