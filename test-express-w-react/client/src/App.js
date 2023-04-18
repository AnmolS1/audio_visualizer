import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { access_token, logout } from './spotify';
import {
	Login,
	Profile,
	TopArtists,
	TopTracks,
	Playlists,
	Playlist,
	CurrentlyPlaying
} from './pages';
import { GlobalStyle } from './styles';
import styled from 'styled-components/macro';

const StyledLogoutButton = styled.button`
	position: absolute;
	top: var(--spacing-sm);
	right: var(--spacing-md);
	padding: var(--spacing-xs) var(--spacing-sm);
	background-color: rgba(0, 0, 0, 0.7);
	color: var(--white);
	font-size: var(--fz-sm);
	font-weight: 700;
	border-radius: var(--border-radius-pill);
	z-index: 10;
	@media (min-width: 768px) {
		right: var(--spacing-lg);
	}
`;

function ScrollToTop() {
	const { pathname } = useLocation();
	
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	
	return null;
}

function App() {
	const [ token, setToken ] = useState(null);
	
	useEffect(() => {
		setToken(access_token);
	}, []);
	
	return (
		<div className="App">
			<GlobalStyle />
			
			{!token ?  (
				<Login />
			) : (
				<>
					<StyledLogoutButton onClick={logout}>Log Out</StyledLogoutButton>
					
					<Router>
						<ScrollToTop />
						
						<Routes>
							{/* testing currently playing page */}
							<Route path="/currently-playing" element={<CurrentlyPlaying />} />
							<Route path="/top-artists" element={<TopArtists />} />
							<Route path="/top-tracks" element={<TopTracks />} />
							<Route path="/playlists/:id" element={<Playlist />} />
							<Route path="/playlists" element={<Playlists />} />
							<Route path="/" element={<Profile />} />
						</Routes>
					</Router>
				</>
			)}
		</div>
	);
}

export default App;