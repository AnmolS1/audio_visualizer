import { useState, useEffect } from 'react';
import { getCurrentState } from '../spotify';
import { catchErrors } from '../utils';

const CurrentlyPlaying = () => {
	const [ playing, setPlaying ] = useState('Loading...');
	
	useEffect(() => {
		const intervalId = setInterval(() => {
			const fetchData = async() => {
				const { data } = await getCurrentState();
				
				if (data === '') {
					setPlaying('Not Currently Playing');
				} else {
					setPlaying(data.item.name);
				}
			};
			
			catchErrors(fetchData());
		}, 3000);
		
		return () => clearInterval(intervalId);
	}, []);
	
	return (
		<>
			<h1>test</h1>
			<p>{playing}</p>
		</>
	);
};

export default CurrentlyPlaying;