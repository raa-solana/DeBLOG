import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStorageAccount, getFileContent } from '../utils/shdw';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { STORAGE_IDENTIFIER } from '../constants';

const ArticleList: React.FC = () => {
  const wallet = useWallet();
  const [articles, setArticles] = useState<Array<{ title: string; id: string }>>([]);
  const { connection } = useConnection();

  useEffect(() => {
    const fetchArticles = async () => {
      const storageAccount = await getStorageAccount(wallet, STORAGE_IDENTIFIER, connection);
      if (storageAccount) {
        const indexFile = await getFileContent(storageAccount.publicKey, 'index.json');
        if (indexFile) {
          const articleList = JSON.parse(indexFile);
          setArticles(articleList);
        }
      }
    };
    fetchArticles();
  }, [wallet, connection]);

  return (
    <div className="article-list-container">
      <h2>Articles</h2>
      <ul className="article-list">
        {articles.map((article) => (
          <li key={article.id}>
            <Link to={`/article/${article.id}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
      <Link to="/create-article">Create New Article</Link>
    </div>
  );
};

export default ArticleList;
