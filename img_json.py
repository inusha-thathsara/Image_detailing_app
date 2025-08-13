import json
import base64
import zlib

def image_to_compressed_json(image_path, json_path):
    # Read binary image data
    with open(image_path, 'rb') as f:
        img_data = f.read()
    # Compress the image data
    compressed_data = zlib.compress(img_data)
    # Encode compressed data as base64 string for JSON
    b64_data = base64.b64encode(compressed_data).decode('utf-8')
    # Create JSON object
    json_obj = {
        'filename': image_path,
        'compressed_image_data': b64_data
    }
    # Write JSON file
    with open(json_path, 'w') as jf:
        json.dump(json_obj, jf)

def json_to_image(json_path, output_image_path):
    # Read JSON file
    with open(json_path, 'r') as jf:
        json_obj = json.load(jf)
    # Decode base64 string
    compressed_data = base64.b64decode(json_obj['compressed_image_data'])
    # Decompress to get original image data
    img_data = zlib.decompress(compressed_data)
    # Write original image binary
    with open(output_image_path, 'wb') as f:
        f.write(img_data)

# Example usage:
image_to_compressed_json('input_image.png', 'image.json')
json_to_image('image.json', 'restored_image.png')
