# Cloth Segmentation Mini

This is a lightweight, standalone version of the cloth segmentation functionality that uses a U2NET model to segment clothing in images. It provides segmentation masks, individual class images with chroma key backgrounds, and detects centroids of clothing parts.

## Features

- Clothing segmentation into 3 classes:
  - Class 1: Upper body clothing (red)
  - Class 2: Lower body clothing (green)
  - Class 3: Full body clothing (blue)
- Outputs:
  - Segmentation overlay image
  - Individual class images with green-screen background (for easy composition)
  - Centroid markers for each detected class
  - JSON file with class information and centroid coordinates

## Installation

1. Clone this repository:
```
git clone https://github.com/your-username/cloth-segmentation-mini.git
cd cloth-segmentation-mini
```

2. Install dependencies:
```
pip install -r requirements.txt
```

The model weights will be automatically downloaded on first run if not found in the `model` directory.

## Usage

### Command Line Interface

Process an image via the command line:

```bash
python main.py --image path/to/your/image.jpg
```

Optional arguments:
- `--cuda`: Use CUDA if available (default: CPU)
- `--output`: Custom output directory (default: output)
- `--save_overlay`: Save the overlay image with all class segmentations
- `--save_centroids`: Save the image with centroids marked

Command line examples:
```bash
# Basic usage - saves only class images and JSON data
python main.py --image input.jpg

# Save all possible output images
python main.py --image input.jpg --save_overlay --save_centroids

# Use GPU acceleration
python main.py --image input.jpg --cuda
```

### Python API

You can also use the segmentation functionality in your Python code:

```python
from process import process_image

# Basic usage (only saves class images and JSON)
result = process_image(
    image_path='path/to/your/image.jpg',
    output_dir='output',  # optional
    use_cuda=False        # optional
)

# To also save overlay and centroids images
result = process_image(
    image_path='path/to/your/image.jpg',
    output_dir='output',
    use_cuda=False,
    save_overlay=True,
    save_centroids=True
)

# Access the results
if 'overlay_path' in result:  # only if save_overlay=True
    overlay_path = result['overlay_path']
    
if 'centroids_path' in result:  # only if save_centroids=True
    centroids_path = result['centroids_path']
    
json_path = result['json_path']
class_paths = result['class_paths']
class_indices = result['class_indices']
segmentation_info = result['segmentation_info']

# Print centroids info
print(f"Detected {segmentation_info['num_classes']} classes")
for cls, data in segmentation_info['classes'].items():
    print(f"Class {cls} center: {data['center']}")
```

## Output Files

The following files will be generated:
- `class1.png`: Upper body
- `class2.png`: Lower body
- `class3.png`: Full bodyx
- `segmentation.json`: JSON file with segmentation information

Optional files (only created with specific flags):
- `overlay.png`: Original image with colored segmentation overlay (when using --save_overlay)
- `centroids.png`: Original image with centroids marked (when using --save_centroids)

## Model

This project uses a U2NET model trained for clothing segmentation. The weights will be automatically downloaded from a Google Drive link on first use.

## License

[Include appropriate license information] 