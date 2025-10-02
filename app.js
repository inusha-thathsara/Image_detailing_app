const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const https = require('https');
const { URL } = require('url');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

app.use(express.static('public'));
app.use(bodyParser.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });


// POST /convert-image-to-json: upload image, get JSON (uses img_to_json.py)
app.post('/convert-image-to-json', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No image uploaded');
    const imagePath = path.resolve(req.file.path);
    const jsonPath = path.resolve(req.file.path + '.json');
    const scriptPath = path.resolve(__dirname, 'img_to_json.py');

    const pythonCmd = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
    let stderr = '', stdout = '';
    let py = spawn(pythonCmd, [scriptPath, imagePath, jsonPath], { shell: false });

    const handleFinish = (code, triedAlt) => {
        if (code !== 0 || !fs.existsSync(jsonPath)) {
            console.error('Python exit code:', code, 'stderr:', stderr, 'stdout:', stdout);
            if (!triedAlt && process.platform === 'win32') {
                // Try Windows py launcher as a fallback
                stderr = '';
                stdout = '';
                py = spawn('py', ['-3', scriptPath, imagePath, jsonPath], { shell: false });
                py.stdout.on('data', (d) => stdout += d.toString());
                py.stderr.on('data', (d) => stderr += d.toString());
                py.on('error', (err) => {
                    console.error('Spawn error (py -3):', err);
                    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                    return res.status(500).send('Python spawn failed: ' + err.message);
                });
                py.on('close', (code2) => handleFinish(code2, true));
                return;
            }
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(500).send('Python conversion failed. Details: ' + (stderr || 'no stderr') + ' | code=' + code);
        }
        res.download(jsonPath, 'image.json', (err) => {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
        });
    };

    py.stdout.on('data', (d) => stdout += d.toString());
    py.stderr.on('data', (d) => stderr += d.toString());
    py.on('error', (err) => {
        console.error('Spawn error (python):', err);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        return res.status(500).send('Python spawn failed: ' + err.message);
    });
    py.on('close', (code) => handleFinish(code, false));
});


// POST /convert-json-to-image: upload JSON, get image (uses json_to_img.py)
app.post('/convert-json-to-image', upload.single('jsonfile'), (req, res) => {
    if (!req.file) return res.status(400).send('No JSON uploaded');
    const jsonPath = path.resolve(req.file.path);
    const outImagePath = path.resolve(req.file.path + '.png');
    const scriptPath = path.resolve(__dirname, 'json_to_img.py');

    const pythonCmd = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
    let stderr = '', stdout = '';
    let py = spawn(pythonCmd, [scriptPath, jsonPath, outImagePath], { shell: false });

    const handleFinish = (code, triedAlt) => {
        if (code !== 0 || !fs.existsSync(outImagePath)) {
            console.error('Python exit code:', code, 'stderr:', stderr, 'stdout:', stdout);
            if (!triedAlt && process.platform === 'win32') {
                // Try Windows py launcher as a fallback
                stderr = '';
                stdout = '';
                py = spawn('py', ['-3', scriptPath, jsonPath, outImagePath], { shell: false });
                py.stdout.on('data', (d) => stdout += d.toString());
                py.stderr.on('data', (d) => stderr += d.toString());
                py.on('error', (err) => {
                    console.error('Spawn error (py -3):', err);
                    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                    return res.status(500).send('Python spawn failed: ' + err.message);
                });
                py.on('close', (code2) => handleFinish(code2, true));
                return;
            }
            if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
            return res.status(500).send('Python restoration failed. Details: ' + (stderr || 'no stderr') + ' | code=' + code);
        }
        res.download(outImagePath, 'restored_image.png', (err) => {
            if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
            if (fs.existsSync(outImagePath)) fs.unlinkSync(outImagePath);
        });
    };

    py.stdout.on('data', (d) => stdout += d.toString());
    py.stderr.on('data', (d) => stderr += d.toString());
    py.on('error', (err) => {
        console.error('Spawn error (python):', err);
        if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
        return res.status(500).send('Python spawn failed: ' + err.message);
    });
    py.on('close', (code) => handleFinish(code, false));
});

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
