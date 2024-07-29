import React, { useEffect, useState } from 'react';
import { STORAGE_ACCOUNT_PUBLIC_KEY } from '../constants';
import { getFileContent } from '../utils/shdw';


interface Article {
  title: string;
  date: string;
}

const ArticleListPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      const indexContent = await getFileContent(STORAGE_ACCOUNT_PUBLIC_KEY, 'index.json');
      if (!indexContent) {
        setError("No articles found");
        setLoading(false);
        return;
      }
      const articles = JSON.parse(indexContent);
      setArticles(articles);
      setLoading(false);
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="article-list-container">
      <h2>Article List</h2>
      <ul className="article-list">
        {articles.map((article, index) => (
          <li key={index}>
            <a href={`/article/${article.title}`}>{article.title}</a> - <span>{article.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleListPage;
