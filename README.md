# Image Detailing App

A web app to view image details by uploading a file or entering an image URL. Built with Node.js, Express, and vanilla JS.

## Features
- Upload an image or enter an image URL
- View image width, height, aspect ratio, orientation, pixel count, and resolution
- Light/dark theme toggle
- Robust URL loading with CORS/hotlink fallback via backend proxy

## Usage
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the server:
   ```powershell
   npm start
   ```
3. Open your browser to [http://localhost:3000](http://localhost:3000)
4. Use "Upload Image" or "Enter Image URL" to view image details.

## Troubleshooting
- If an image URL fails to load, the app will attempt to fetch it via a backend proxy. Some sites may still block hotlinking.
- For local images, use the Upload feature.
- If you change code, restart the server with `npm start`.

## Development
- Main server: `app.js`
- Frontend: `public/`
- Sample images/data: `sample/`

## License
MIT
