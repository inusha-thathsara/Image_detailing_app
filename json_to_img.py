import json
import base64
import zlib
import sys

def json_to_image(json_path, output_image_path):
    with open(json_path, 'r') as jf:
        json_obj = json.load(jf)
    compressed_data = base64.b64decode(json_obj['compressed_image_data'])
    img_data = zlib.decompress(compressed_data)
    with open(output_image_path, 'wb') as f:
        f.write(img_data)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python json_to_img.py <input_json> <output_image>")
        sys.exit(1)
    json_to_image(sys.argv[1], sys.argv[2])
