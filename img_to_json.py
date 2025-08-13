import json
import base64
import zlib
import sys

def image_to_compressed_json(image_path, json_path):
    with open(image_path, 'rb') as f:
        img_data = f.read()
    compressed_data = zlib.compress(img_data)
    b64_data = base64.b64encode(compressed_data).decode('utf-8')
    json_obj = {
        'filename': image_path,
        'compressed_image_data': b64_data
    }
    with open(json_path, 'w') as jf:
        json.dump(json_obj, jf)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python img_to_json.py <input_image> <output_json>")
        sys.exit(1)
    image_to_compressed_json(sys.argv[1], sys.argv[2])
