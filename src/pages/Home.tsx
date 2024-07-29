import React, { useState, useEffect } from 'react';
import { getFileContent } from '../utils/shdw';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { STORAGE_ACCOUNT_PUBLIC_KEY } from '../constants';
import { Link } from 'react-router-dom';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const indexContent = await getFileContent(STORAGE_ACCOUNT_PUBLIC_KEY, 'index.json');
        if (indexContent) {
          const indexData = JSON.parse(indexContent);
          if (indexData.articles && Array.isArray(indexData.articles)) {
            setArticles(indexData.articles);
          } else {
            console.error('Articles is not an array:', indexData.articles);
            setArticles([]);
          }
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      }
    };

    fetchArticles();
  }, [wallet, connection]);

  return (
    <div className="articles-container">
      <ul className="article-list">
        {articles.map((article, index) => (
          <li key={index} className="article-item">
            <Link to={`/article/${article.title}`}>
              {article.thumbnail && <img src={`https://shdw-drive.genesysgo.net/${STORAGE_ACCOUNT_PUBLIC_KEY}/${article.thumbnail}?c=${Date.now()}`} alt={article.title} className="article-thumbnail" />}
              <div className="article-content">
                <h2>{article.title}</h2>
                <p>{new Date(article.date).toLocaleString()}</p>
                <p>{article.paragraph}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
