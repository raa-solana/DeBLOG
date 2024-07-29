import React, { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getFileContent } from '../utils/shdw';
import { STORAGE_ACCOUNT_PUBLIC_KEY } from '../constants';

const Header: React.FC = () => {
  const [blogName, setBlogName] = useState('DeBLOG');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const indexContent = await getFileContent(STORAGE_ACCOUNT_PUBLIC_KEY, 'index.json');
        if (indexContent) {
          const BlogData = JSON.parse(indexContent).settings;
          if (BlogData.blogName) {
            setBlogName(BlogData.blogName);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchArticles();
  }, []);

  return (
    <header className="header">
      <div className="header-title">{blogName}</div>
      <div className="header-wallet-button">
        <WalletMultiButton />
      </div>
    </header>
  );
};

export default Header;
