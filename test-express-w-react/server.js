require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const axios = require('axios');

const port = process.env.PORT || 8080;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

const app = express();

const generateRandomString = len => {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	
	for (let i = 0; i < len; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

const state_key = 'spotify_auth_state';

app.get('/login', (req, res) => {
	const state = generateRandomString(16);
	res.cookie(state_key, state);
	
	const scope = [
		'user-read-private',
		'user-read-email',
		'user-top-read',
		'user-read-playback-state'
	].join(' ');
	
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			redirect_uri: redirect_uri,
			state: state,
			scope: scope
		})
	);
});

app.get('/callback', (req, res) => {
	const code = req.query.code || null;
	
	axios({
		method: 'post',
		url: 'https://accounts.spotify.com/api/token',
		data: querystring.stringify({
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirect_uri
		}),
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
		}
	}).then(response => {
		if (response.status === 200) {
			const { access_token, refresh_token, expires_in } = response.data;
			
			const params = querystring.stringify({
				access_token,
				refresh_token,
				expires_in
			});
			
			res.redirect(`http://localhost:3000/?${params}`);
		} else {
			res.redirect(`/?${querystring.stringify({error: 'invalid_token'})}`);
		}
	}).catch(error => {
		res.send(error);
		console.log('error occurred');
	});
});

app.get('/refresh_token', (req, res) => {
	const { refresh_token } = req.query;
	
	axios({
		method: 'post',
		url: 'https://accounts.spotify.com/api/token',
		data: querystring.stringify({
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		}),
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
		}
	}).then(response => {
		res.send(response.data);
	}).catch(error => {
		res.send(error);
	});
});

app.listen(port, () => { console.log(`Listening on port ${port}`); });