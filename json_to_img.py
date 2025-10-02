import json
import base64
import zlib
import sys
from typing import Any, Dict


def json_to_image(json_path: str, output_image_path: str) -> None:
    """Reconstruct an image file from a JSON produced by the image->JSON converter.

    The JSON is expected to contain a base64 string under the key 'compressed_image_data'
    which itself is a zlib-compressed byte sequence of the original binary image.
    """
    try:
        try:
            with open(json_path, 'r', encoding='utf-8') as jf:
                json_obj: Dict[str, Any] = json.load(jf)
        except UnicodeDecodeError:
            # Fallback for files saved with a different legacy codepage.
            with open(json_path, 'r', encoding='latin-1') as jf:
                json_obj = json.load(jf)
    except FileNotFoundError:
        print(f"Error: JSON file not found: {json_path}")
        sys.exit(2)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format ({e})")
        sys.exit(3)

    if 'compressed_image_data' not in json_obj:
        print("Error: Key 'compressed_image_data' not found in JSON.")
        sys.exit(4)

    try:
        compressed_data = base64.b64decode(json_obj['compressed_image_data'])
    except (TypeError, ValueError) as e:
        print(f"Error: Unable to base64 decode data ({e})")
        sys.exit(5)

    try:
        img_data = zlib.decompress(compressed_data)
    except zlib.error as e:
        print(f"Error: zlib decompression failed ({e})")
        sys.exit(6)

    try:
        with open(output_image_path, 'wb') as f:
            f.write(img_data)
    except OSError as e:
        print(f"Error: Could not write output image file ({e})")
        sys.exit(7)

    print(f"Success: Image reconstructed -> {output_image_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python json_to_img.py <input_json> <output_image>")
        sys.exit(1)
    json_to_image(sys.argv[1], sys.argv[2])
