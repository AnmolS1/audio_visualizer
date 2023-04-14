import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUserPlaylists } from '../spotify';
import { catchErrors } from '../utils';
import { SectionWrapper, PlaylistsGrid, Loader } from '../components';

const Playlists = () => {
	const [ playlistsData, setPlaylistsData ] = useState(null);
	const [ playlists, setPlaylists ] = useState(null);
	
	useEffect(() => {
		const fetchData = async() => {
			const { data } = await getCurrentUserPlaylists();
			setPlaylistsData(data);
		}
		
		catchErrors(fetchData());
	}, []);
	
	useEffect(() => {
		if (!playlistsData) {
			return;
		}
		
		console.log(playlistsData.next);
		
		const fetchMoreData = async() => {
			if (playlistsData.next) {
				const { data } = await axios.get(playlistsData.next);
				setPlaylistsData(data);
			}
		};
		
		setPlaylists(playlists => ([
			...playlists ? playlists : [],
			...playlistsData.items
		]));
		
		catchErrors(fetchMoreData());
	}, [playlistsData]);
	
	return (
		<main>
			<SectionWrapper title="Public Playlists" breadcrumb={true}>
				{
					playlists ? (
						<PlaylistsGrid playlists={playlists} />
					) : (
						<Loader />
					)
				}
			</SectionWrapper>
		</main>
	);
};

export default Playlists;