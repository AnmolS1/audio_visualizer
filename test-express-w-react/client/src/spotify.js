import axios from 'axios';

const LOCALSTORAGE_KEYS = {
	access_token: 'spotify_access_token',
	refresh_token: 'spotify_refresh_token',
	expire_time: 'spotify_token_expire_time',
	timestamp: 'spotify_token_timestamp'
};

const LOCALSTORAGE_VALUES = {
	access_token: window.localStorage.getItem(LOCALSTORAGE_KEYS.access_token),
	refresh_token: window.localStorage.getItem(LOCALSTORAGE_KEYS.refresh_token),
	expire_time: window.localStorage.getItem(LOCALSTORAGE_KEYS.expire_time),
	timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp)
};

const hasTokenExpired = () => {
	const { access_token, timestamp, expire_time } = LOCALSTORAGE_VALUES;
	
	if (!access_token || !timestamp) {
		return false;
	}
	
	const millisecondsElapsed = Date.now() - Number(timestamp);
	return (millisecondsElapsed / 1000) > Number(expire_time);
};

const refreshToken = async() => {
	try {
		if (!LOCALSTORAGE_VALUES.refresh_token || LOCALSTORAGE_VALUES.refresh_token === 'undefined' || (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000) {
			console.error('No refresh token available');
			logout();
		}
		
		const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refresh_token}`);
		
		window.localStorage.setItem(LOCALSTORAGE_KEYS.access_token, data.access_token);
		window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
		
		window.location.reload();
	} catch (e) {
		console.error(e);
	}
};

export const logout = () => {
	for (const property in LOCALSTORAGE_KEYS) {
		window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
	}
	
	window.location = window.location.origin;
}

const getAccessToken = () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const queryParams = {
		[LOCALSTORAGE_KEYS.access_token]: urlParams.get('access_token'),
		[LOCALSTORAGE_KEYS.refresh_token]: urlParams.get('refresh_token'),
		[LOCALSTORAGE_KEYS.expire_time]: urlParams.get('expires_in')
	};
	const hasError = urlParams.get('error');
	
	if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.access_token === 'undefined') {
		refreshToken();
	}
	
	if (LOCALSTORAGE_VALUES.access_token && LOCALSTORAGE_VALUES.access_token !== 'undefined') {
		return LOCALSTORAGE_VALUES.access_token;
	}
	
	if (queryParams[LOCALSTORAGE_KEYS.access_token]) {
		for (const property in queryParams) {
			window.localStorage.setItem(property, queryParams[property]);
		}
		
		window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
		
		return queryParams[LOCALSTORAGE_KEYS.access_token];
	}
	
	return false;
}

export const access_token = getAccessToken();

axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${access_token}`
axios.defaults.headers['Content-Type'] = 'application/json';

export const getCurrentUserProfile = () => axios.get('/me');
export const getCurrentUserPlaylists = (limit = 20) => {
	return axios.get(`/me/playlists?limit=${limit}`);
};
export const getTopArtists = (time_range = 'short_term') => {
	return axios.get(`/me/top/artists?time_range=${time_range}`);
};
export const getTopTracks = (time_range = 'short_term') => {
	return axios.get(`/me/top/tracks?time_range=${time_range}`);
};
export const getPlaylistById = playlist_id => {
	return axios.get(`/playlists/${playlist_id}`);
};
export const getAudioFeaturesForTracks = ids => {
	return axios.get(`/audio-features?ids=${ids}`);
};