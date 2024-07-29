import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import {
    WalletModalProvider,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import React, { FC, ReactNode, useMemo } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import CreateArticlePage from "./pages/CreateArticlePage";
import SettingsPage from "./pages/SettingsPage";
import NoStoragePage from "./pages/NoStoragePage";
import ArticleListPage from "./pages/ArticleListPage";
import Header from "./components/Header";
import { RPC_ENDPOINT } from "./constants";
import './App.css';

export const App: FC = () => {
    return (
        <Context>
            <Router>
                <Header />
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/article/:id" element={<ArticlePage />} />
                        <Route path="/create-article" element={<CreateArticlePage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/no-storage" element={<NoStoragePage />} />
                        <Route path="/article-list" element={<ArticleListPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    const network = RPC_ENDPOINT;
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider
            endpoint={network}
            config={{
                commitment: "confirmed",
                httpHeaders: {
                    Authorization:
                        "Bearer {GENESYSGO AUTHENTICATION TOKEN HERE}",
                },
            }}
        >
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
