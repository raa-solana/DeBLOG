import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFileContent } from '../utils/shdw';
import { STORAGE_ACCOUNT_PUBLIC_KEY } from '../constants';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<{
    title: string;
    content: string;
    thumbnail: string;
    createdAt: string;
  } | null>(null);
  const [author, setAuthor] = useState<{ name: string; icon: string }>({ name: '', icon: '' });

  useEffect(() => {
    const fetchArticle = async () => {
      const articleContent = await getFileContent(STORAGE_ACCOUNT_PUBLIC_KEY, `${id}.json`);
      const indexContent = await getFileContent(STORAGE_ACCOUNT_PUBLIC_KEY, `index.json`);
      
      if (articleContent) {
        setArticle(JSON.parse(articleContent));
      }

      if (indexContent) {
        const indexData = JSON.parse(indexContent);
        const authorInfo = indexData.settings;
        setAuthor({ name: authorInfo.authorName, icon: authorInfo.authorIcon });
      }
    };
    
    fetchArticle();
  }, [id]);

  return (
    <div className="article-container">
      {article ? (
        <>
          {article.thumbnail && <img className="thumbnail" src={`https://shdw-drive.genesysgo.net/${STORAGE_ACCOUNT_PUBLIC_KEY}/${article.thumbnail}?c=${Date.now()}`} alt="Thumbnail" />}
            <div className="article-detail">
              <div className="article-header">
                <h1>{article.title}</h1>
              </div>
              <div className="author-info">
                <img className="author-icon" src={`https://shdw-drive.genesysgo.net/${STORAGE_ACCOUNT_PUBLIC_KEY}/${author.icon}?c=${Date.now()}`} alt="Author Icon" />
                <p>By {author.name}<br />
                  Posted on {new Date(article.createdAt).toLocaleString()}</p>
                <p></p>
              </div>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ArticleDetail;
