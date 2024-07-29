import React, { useEffect, useState } from "react";
import { ShdwDrive, StorageAccountResponse, ShadowDriveVersion } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Container, Grid, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import CreateAccountForm from './components/CreateAccount';
import AccountSelection from './components/AccountSelection';
import FileUpload from './components/FileUpload';

const bytesToHuman = (bytes: any, si = false, dp = 1) => {
	const thresh = si ? 1024 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}

	const units = si
		? ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	);

	return bytes.toFixed(dp) + " " + units[u];
}

export default function Drive() {
	const { connection } = useConnection();
	const [drive, setDrive] = useState<ShdwDrive>();
	const wallet = useWallet();
	const [acc, setAcc] = useState<StorageAccountResponse | undefined>();
	const [accs, setAccs] = useState<Array<StorageAccountResponse>>([]);
	const [fileList, setFileList] = useState<FileList | null>(null);
	const [displayFiles, setDisplayFiles] = useState<any[]>([]);
	const [radioValue, setRadioValue] = useState<string>('');
	const [uploadLocs, setUploadLocs] = useState<UploadResponse>([]);
	const [accName, setAccName] = useState<string>('');
	const [accSize, setAccSize] = useState<string>('1MB');
	const [loading, setLoading] = useState<boolean>(false);
	const [tx, setTx] = useState<string>();
	const [version, setVersion] = useState<ShadowDriveVersion>('v2');
	const [fileKeys, setFileKeys] = useState<string[]>([]);

	const listFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const displayFiles = Array.from(e.target.files).map(file => ({
				name: file.name,
				location: ''
			}));
			setDisplayFiles(displayFiles);
			setFileList(e.target.files);
		}
	};

	const handleRadioChange = async (value: string) => {
		setRadioValue(value);
		const selectedAcc = accs.find(acc => acc.publicKey.toString() === value);
		setAcc(selectedAcc);

		if (selectedAcc) {
			try {
				const listItems = await drive?.listObjects(selectedAcc.publicKey);
				console.log('List Items:', listItems); // デバッグ用ログ
				if (listItems && listItems.keys) {
					setFileKeys(listItems.keys);
				} else {
					setFileKeys([]);
				}
			} catch (e) {
				console.log('Error listing files:', e);
				setFileKeys([]);
			}
		} else {
			setFileKeys([]);
		}
	};

	const renderFiles = () => {
		return displayFiles.map((file, index) => {
			const uploadLoc = uploadLocs.find((upload: any) => upload.fileName === file.name);
			file.location = uploadLoc ? uploadLoc.location : '';
			return (
				<div key={index} style={{ margin: '10px' }}>
					<p>File {index + 1}: {file.name}</p>
					<p>Upload Location: {file.location ? (<a href={file.location} target="_blank" rel="noopener noreferrer">{file.location}</a>) : (<CircularProgress size={20} />)}</p>
				</div>
			);
		});
	};

	const createAccount = async () => {
		if (!accName || !accSize || !version) return;
		try {
			setLoading(true);
			const result = await drive?.createStorageAccount(accName, accSize, version);
			setTx(result!.transaction_signature);
		} catch (e) {
			console.log(e);
		}
		refreshAccounts();
		setLoading(false);
	}

	useEffect(() => {
		(async () => {
			if (wallet.connected) {
				try {
					const drive = await new ShdwDrive(connection, wallet).init();
					setDrive(drive);
				} catch (error) {
					console.error("Failed to initialize ShdwDrive:", error);
				}
			}
		})();
	}, [wallet.connected])

	const refreshAccounts = async () => {
		if (drive) {
			const accounts = await drive.getStorageAccounts('v2');
			setAccs(accounts || []);
		}
	}

	useEffect(() => {
		if (drive) {
			refreshAccounts();
		}
	}, [drive])

	return (
		<Container>
			<Grid container>
				<Grid item xs={12} justifyContent="center">
					<h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Shadow Drive Example App</h1>
					<div style={{ textAlign: 'center' }}>
						<WalletMultiButton />
					</div>
				</Grid>
			</Grid>
			<Grid container>
				<Grid item xs={6}>
					<CreateAccountForm
						accName={accName}
						setAccName={setAccName}
						accSize={accSize}
						setAccSize={setAccSize}
						version={version}
						setVersion={setVersion}
						createAccount={createAccount}
						loading={loading}
						tx={tx}
					/>
				</Grid>
				<Grid item xs={6}>
					<AccountSelection
						accs={accs}
						radioValue={radioValue}
						setRadioValue={handleRadioChange}
						setAcc={setAcc}
						bytesToHuman={bytesToHuman}
					/>
					<FileUpload
						listFiles={listFiles}
						fileList={fileList}
						displayFiles={displayFiles}
						renderFiles={renderFiles}
						drive={drive}
						acc={acc}
						setUploadLocs={setUploadLocs}
					/>
					{fileKeys.length > 0 && (
						<List>
							{fileKeys.map((key, index) => (
								<ListItem key={index}>
									<ListItemText primary={key} />
								</ListItem>
							))}
						</List>
					)}
				</Grid>
			</Grid>
		</Container>
	)
}
