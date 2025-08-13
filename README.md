# Image Detailing App

A web app to view image details and convert images ↔ JSON. Built with Node.js, Express, and vanilla JS.

## Features
- Upload an image or enter an image URL
- View image width, height, aspect ratio, orientation, pixel count, and resolution
- Light/dark theme toggle
- Robust URL loading with CORS/hotlink fallback via backend proxy
- Image ↔ JSON converter page: compresses image bytes to base64 JSON and restores image from that JSON

## Prerequisites
- Node.js (LTS recommended)
- Python 3 available on PATH
   - Windows: the server will try `python`, then fallback to `py -3`
   - You can override by setting an environment variable: `$env:PYTHON = "C:\\Path\\to\\python.exe"`

## Install and Run
1. Install Node dependencies:
    ```powershell
    npm install
    ```
2. Start the server:
    ```powershell
    npm start
    ```
3. Open your browser to:
    - Home: http://localhost:3000
    - Image URL page: http://localhost:3000/img-url.html
    - Upload page: http://localhost:3000/upload.html
    - Image ↔ JSON converter: http://localhost:3000/img-json.html

Important: Use the Express server URLs above. Opening pages via Live Server or file:// will cause API calls to fail (405/404).

## Using the Image ↔ JSON Converter
On the home page, click “Image ↔ JSON Converter”.

- Convert image → JSON
   1. Choose an image file
   2. Click “Convert & Download JSON”
   3. A JSON file downloads containing the zlib-compressed, base64-encoded bytes of the original image

- Restore JSON → image
   1. Choose a JSON file previously created by this app
   2. Click “Restore & Download Image”
   3. A file named `restored_image.png` downloads (it contains the original bytes; rename the extension if needed)

## API Endpoints
- POST `/convert-image-to-json`
   - multipart/form-data field: `image` (file)
   - returns: JSON file download

- POST `/convert-json-to-image`
   - multipart/form-data field: `jsonfile` (file)
   - returns: image file download (`restored_image.png`)

## Troubleshooting
- 405 Method Not Allowed or network errors when converting:
   - Make sure you are using http://localhost:3000 (Express) and not a different port (e.g. 5500 from Live Server)

- 500 Internal Server Error when converting/restoring:
   - Ensure Python 3 is installed and callable (PowerShell):
      ```powershell
      python --version
      ```
   - Test the scripts manually:
      ```powershell
      # Image -> JSON
      python img_to_json.py sample/codintro.jpg test.json

      # JSON -> Image
      python json_to_img.py sample/image_details_sample.json out.png
      ```
   - Check the server terminal for detailed error output (stderr and exit code are logged)
   - On Windows, you can set the Python executable explicitly:
      ```powershell
      $env:PYTHON = "py"
      npm start
      ```

- Image URL still won’t load:
   - Some hosts block hotlinking; try downloading the image and using the Upload page instead.

## Project Structure
- Main server: `app.js`
- Frontend: `public/`
- Sample images/data: `sample/`
- Python helpers: `img_to_json.py`, `json_to_img.py` (no external packages required)

## License
MIT
