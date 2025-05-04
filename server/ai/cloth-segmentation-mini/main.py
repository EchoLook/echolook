#!/usr/bin/env python3
"""
Main script for cloth segmentation model usage.
This script demonstrates how to use the process_image function to segment clothing in an image.
"""

import os
import argparse
import requests
from process import process_image
from io import BytesIO
from PIL import Image
from urllib.parse import urlparse

def download_image(url):
    """Download an image from a URL and return the local file path."""
    response = requests.get(url)
    if response.status_code == 200:
        # Get the image content and save it to a temporary file
        img = Image.open(BytesIO(response.content))
        path = urlparse(url).path
        ext = os.path.splitext(path)[1]
        temp_image_path = "temp_image"+ext
        img.save(temp_image_path)
        return temp_image_path
    else:
        raise ValueError(f"Failed to download image. Status code: {response.status_code}")

def main():
    """Example of using the cloth segmentation API"""
    
    parser = argparse.ArgumentParser(description='Cloth Segmentation Tool')
    parser.add_argument('--image', type=str, required=True, help='Path to the input image or URL to an image')
    parser.add_argument('--cuda', action='store_true', help='Use CUDA if available')
    parser.add_argument('--output', type=str, default='output', help='Output directory')
    parser.add_argument('--save_overlay', action='store_true', help='Save overlay image')
    parser.add_argument('--save_centroids', action='store_true', help='Save centroids image')
    parser.add_argument('--threshold', type=float, default=0.0, help='Confidence threshold for segmentation (0.0-1.0)')
    args = parser.parse_args()
    
    # Make sure output directory exists
    os.makedirs(args.output, exist_ok=True)
    
    # Check if the image argument is a URL or a local file
    if args.image.startswith("http://") or args.image.startswith("https://"):
        print(f"Downloading image from URL: {args.image}")
        image_path = download_image(args.image)
    else:
        image_path = args.image

    # Process the image
    print(f"Processing image: {image_path}")
    print(f"Using CUDA: {'Yes' if args.cuda else 'No'}")
    print(f"Output directory: {args.output}")
    print(f"Save overlay: {'Yes' if args.save_overlay else 'No'}")
    print(f"Save centroids: {'Yes' if args.save_centroids else 'No'}")
    print(f"Confidence threshold: {args.threshold}")
    print("Processing...")
    
    result = process_image(
        image_path=image_path,
        output_dir=args.output,
        use_cuda=args.cuda,
        save_overlay=args.save_overlay,
        save_centroids=args.save_centroids,
        confidence_threshold=args.threshold
    )
    
    # Print results
    print("\n=== Results ===")
    
    # Print optional paths if they were created
    if args.save_overlay and 'overlay_path' in result:
        print(f"Overlay image: {result['overlay_path']}")
    
    if args.save_centroids and 'centroids_path' in result:
        print(f"Centroid image: {result['centroids_path']}")
    
    print(f"JSON data: {result['json_path']}")
    
    print("\nClass images:")
    class_names = ["", "Upper body (red)", "Lower body (green)", "Full body (blue)"]
    for i, path in enumerate(result['class_paths']):
        cls = result['class_indices'][i]
        print(f"  Class {cls} ({class_names[cls]}): {path}")
    
    print("\nSegmentation info:")
    info = result['segmentation_info']
    print(f"Number of classes detected: {info['num_classes']}")
    for cls, data in info['classes'].items():
        class_name = ["", "Upper body (red)", "Lower body (green)", "Full body (blue)"][int(cls)]
        print(f"  Class {cls} ({class_name}):")
        print(f"    Center: ({data['center'][0]:.1f}, {data['center'][1]:.1f})")

if __name__ == "__main__":
    main()
