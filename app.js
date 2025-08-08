const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const https = require('https');
const { URL } = require('url');

app.use(express.static('public'));
app.use(bodyParser.json());

// Simple image proxy to work around CORS/hotlink restrictions for some hosts
// Usage: GET /proxy?url=<encoded image url>
app.get('/proxy', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Missing url');
    }
    let urlObj;
    try {
        urlObj = new URL(targetUrl);
    } catch (e) {
        return res.status(400).send('Invalid url');
    }

    const client = urlObj.protocol === 'http:' ? http : https;
    const requestOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': '*/*',
            // Some hosts require a Referer to permit image fetches
            'Referer': `${urlObj.origin}/`
        }
    };

    const forward = (u) => {
        const reqUp = client.get(u, requestOptions, (upstream) => {
            // Follow a single redirect if present
            if (upstream.statusCode && upstream.statusCode >= 300 && upstream.statusCode < 400 && upstream.headers.location) {
                try {
                    const next = new URL(upstream.headers.location, u);
                    return forward(next);
                } catch (e) {
                    return res.status(502).send('Bad redirect');
                }
            }

            if (upstream.statusCode && upstream.statusCode >= 400) {
                return res.status(upstream.statusCode).send(`Upstream error ${upstream.statusCode}`);
            }

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=300');
            if (upstream.headers['content-type']) {
                res.setHeader('Content-Type', upstream.headers['content-type']);
            }
            upstream.pipe(res);
        });
        reqUp.on('error', (err) => {
            res.status(502).send('Failed to fetch image');
        });
    };

    forward(urlObj);
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
