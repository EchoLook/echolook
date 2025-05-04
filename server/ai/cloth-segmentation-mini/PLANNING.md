# Project Planning Document

## Project Overview

This project is a lightweight, standalone cloth segmentation tool that uses a U2NET deep learning model to segment clothing in images. It's designed to be simple, efficient, and easy to use both as a command-line tool and as a Python API.

## Architecture

The project is structured with a clean separation of concerns:

### Core Components

1. **Neural Network (network.py)**
   - Implements the U2NET architecture
   - Handles the forward pass for inference
   - Contains all model-related classes and functions

2. **Processing Pipeline (process.py)**
   - Manages the end-to-end segmentation workflow
   - Handles image preprocessing and model inference
   - Processes output masks into useful forms (overlay, individual classes)
   - Calculates centroids for each detected class
   - Provides both API and CLI functionality

3. **Configuration (options.py)**
   - Contains common configuration parameters
   - Defines default paths and settings

### Entry Points

1. **Command Line Interface (main.py)**
   - Provides user-friendly command-line access
   - Parses arguments and displays results
   - Acts as the primary user interface

2. **Python API (process.py)**
   - Allows integration into other Python projects
   - Exposes the `process_image()` function for direct calls

## Design Decisions

### 1. Simplicity First
- Removed all unnecessary UI components
- Focused only on core functionality
- Simplified file naming and organization

### 2. Modularity
- Separated model definition from processing logic
- Made overlay and centroids optional for flexibility
- Created clean API interfaces

### 3. Output Optimization
- Only generate images for detected classes
- Use consistent file naming scheme
- Provide comprehensive JSON output with all metadata

### 4. Error Handling
- Automatic model download if not present
- Proper directory creation
- Input validation

## Implementation Details

### Image Processing Workflow

1. **Input Processing**
   - Load and resize input image to 768x768
   - Apply normalization and tensor conversion
   - Prepare for model inference

2. **Model Inference**
   - Run the model forward pass
   - Apply softmax to get class probabilities
   - Take argmax to get per-pixel class predictions

3. **Output Generation**
   - Resize prediction mask to original image size
   - Generate overlay with transparent colored regions for each class
   - Create individual class images with green chroma key background
   - Calculate centroids for each detected class
   - Generate informative JSON data

### Class Structure

- **Normalize_image**: Custom transform for normalizing tensors
- **U2NET**: Main segmentation model with encoder-decoder architecture
- **RSU blocks**: Specialized U-Net blocks used by U2NET

## Future Enhancements

1. **Containerization**
   - Docker support for easy deployment (next task)

2. **Potential Improvements**
   - Batch processing for multiple images
   - More output format options
   - API server mode for network requests

## Style Conventions

- **Code Style**: Follow PEP 8
- **Documentation**: Use Google-style docstrings
- **Naming**: Use clear, descriptive naming
- **File Structure**: Maintain clean separation of concerns 