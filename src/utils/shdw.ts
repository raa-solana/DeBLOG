import { PublicKey, Connection } from '@solana/web3.js';
import { ShdwDrive, StorageAccountResponse } from '@shadow-drive/sdk';
import { WalletContextState, AnchorWallet } from '@solana/wallet-adapter-react';
import { SHADOW_DRIVE_VERSION, STORAGE_IDENTIFIER, STORAGE_ACCOUNT_PUBLIC_KEY } from '../constants';

export const getStorageAccount = async (wallet: WalletContextState, identifier: string = STORAGE_IDENTIFIER, connection: Connection): Promise<StorageAccountResponse | null> => {
  console.log('getStorageAccount called with:', wallet.publicKey?.toBase58(), identifier);
  if (!wallet.publicKey) return null;
  const drive = await new ShdwDrive(connection, wallet as AnchorWallet).init();
  const accounts = await drive.getStorageAccounts(SHADOW_DRIVE_VERSION);
  console.log('Storage accounts:', accounts);
  return accounts.find((account) => account.account.identifier === identifier) || null;
};

export const getFileContent = async (storageAccountPublicKey: PublicKey, fileName: string): Promise<string | null> => {
  const url = `https://shdw-drive.genesysgo.net/${storageAccountPublicKey.toString()}/${fileName}`;
  const urlWithCache = `${url}?c=${Date.now()}`;
  try {
    const response = await fetch(urlWithCache);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`${fileName} does not exist.`);
        return null;
      }
      throw new Error(`Failed to fetch file from ${url}: ${response.statusText}`);
    }
    const text = await response.text();
    console.log(`${fileName} content:`, text);
    return text;
  } catch (error) {
    console.error("Error fetching file content:", error);
    return null;
  }
};

export const createStorage = async (wallet: WalletContextState, identifier: string = STORAGE_IDENTIFIER, size: string, connection: Connection): Promise<void> => {
  const drive = await new ShdwDrive(connection, wallet as AnchorWallet).init();
  await drive.createStorageAccount(identifier, size, SHADOW_DRIVE_VERSION);
};

export const createArticle = async (
  wallet: WalletContextState,
  identifier: string,
  article: { title: string; createdAt: string; content: string; thumbnail: string },
  connection: Connection
): Promise<boolean> => {
  const storageAccount = await getStorageAccount(wallet, identifier, connection);
  if (!storageAccount) return false;

  const drive = await new ShdwDrive(connection, wallet as AnchorWallet).init();

  // 新しい記事のファイルを作成
  const articleFile = new File([JSON.stringify(article)], `${article.title}.json`, { type: 'application/json' });

  // index.jsonの存在確認
  const indexContent = await getFileContent(storageAccount.publicKey, 'index.json');
  let indexData = { settings: {}, articles: [] };

  if (indexContent) {
    try {
      indexData = JSON.parse(indexContent);
      if (!indexData.articles) {
        indexData.articles = [];
      }
    } catch (error) {
      console.error('Failed to parse index.json content:', error);
    }
  }

  // 新しい記事のメタデータを追加
  indexData.articles.unshift({ title: article.title, date: article.createdAt, thumbnail: article.thumbnail });

  // 更新されたindex.jsonを作成
  const indexBlob = new Blob([JSON.stringify(indexData)], { type: 'application/json' });
  const indexFile = new File([indexBlob], 'index.json', { type: 'application/json' });

  // 記事ファイルをアップロードし、index.jsonを更新
  try {
    await drive.uploadFile(storageAccount.publicKey, articleFile);

    const indexUrl = `https://shdw-drive.genesysgo.net/${storageAccount.publicKey.toString()}/index.json`;
    try {
      await drive.editFile(storageAccount.publicKey, indexUrl, indexFile, 'v2');
    } catch (error) {
      console.log('index.json does not exist, creating a new file');
      await drive.uploadFile(storageAccount.publicKey, indexFile);
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    return false;
  }

  return true;
};

export const saveSettings = async (
  wallet: WalletContextState,
  settings: { blogName: string; authorName: string; authorIcon: string },
  connection: Connection
): Promise<void> => {
  const storageAccount = await getStorageAccount(wallet, STORAGE_IDENTIFIER, connection);
  if (!storageAccount) throw new Error('Storage account not found');

  const drive = await new ShdwDrive(connection, wallet as AnchorWallet).init();

  // index.jsonの存在確認
  const indexContent = await getFileContent(storageAccount.publicKey, 'index.json');
  let indexData = { settings: {}, articles: [] };

  if (indexContent) {
    try {
      indexData = JSON.parse(indexContent);
      if (!indexData.settings) {
        indexData.settings = {};
      }
    } catch (error) {
      console.error('Failed to parse index.json content:', error);
    }
  }

  // 新しい設定情報を追加
  indexData.settings = settings;

  // 更新されたindex.jsonを作成
  const indexBlob = new Blob([JSON.stringify(indexData)], { type: 'application/json' });
  const indexFile = new File([indexBlob], 'index.json', { type: 'application/json' });

  // index.jsonを更新
  const indexUrl = `https://shdw-drive.genesysgo.net/${storageAccount.publicKey.toString()}/index.json`;
  try {
    await drive.editFile(storageAccount.publicKey, indexUrl, indexFile, 'v2');
  } catch (error) {
    console.log('index.json does not exist, creating a new file');
    await drive.uploadFile(storageAccount.publicKey, indexFile);
  }
};

export const uploadThumbnail = async (
  wallet: WalletContextState,
  identifier: string = STORAGE_IDENTIFIER,
  title: string,
  file: File,
  connection: Connection
): Promise<string> => {
  const storageAccount = await getStorageAccount(wallet, identifier, connection);
  if (!storageAccount) throw new Error('Storage account not found');

  const drive = await new ShdwDrive(connection, wallet as AnchorWallet).init();
  const extension = file.name.split('.').pop();
  const fileToUpload = new File([file], `${title}-thumbnail.${extension}`, { type: file.type });
  const result = await drive.uploadFile(storageAccount.publicKey, fileToUpload);
  return `${title}-thumbnail.${extension}`;
};
