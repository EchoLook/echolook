from network import U2NET

import os
from PIL import Image
import cv2
import gdown
import argparse
import numpy as np
import time
import json

import torch
import torch.nn.functional as F
import torchvision.transforms as transforms

from collections import OrderedDict
from options import opt


def load_checkpoint(model, checkpoint_path):
    """
    Load pretrained weights into the model.
    
    Args:
        model: The model to load weights into
        checkpoint_path: Path to the checkpoint file
        
    Returns:
        model: The model with loaded weights
    """
    if not os.path.exists(checkpoint_path):
        print("----No checkpoints at given path----")
        return
    model_state_dict = torch.load(checkpoint_path, map_location=torch.device("cpu"))
    new_state_dict = OrderedDict()
    for k, v in model_state_dict.items():
        name = k[7:]  # remove `module.`
        new_state_dict[name] = v

    model.load_state_dict(new_state_dict)
    print("----checkpoints loaded from path: {}----".format(checkpoint_path))
    return model


def get_palette(num_cls):
    """ 
    Returns the color map for visualizing the segmentation mask.
    
    Args:
        num_cls: Number of classes
        
    Returns:
        The color map
    """
    n = num_cls
    palette = [0] * (n * 3)
    for j in range(0, n):
        lab = j
        palette[j * 3 + 0] = 0
        palette[j * 3 + 1] = 0
        palette[j * 3 + 2] = 0
        i = 0
        while lab:
            palette[j * 3 + 0] |= (((lab >> 0) & 1) << (7 - i))
            palette[j * 3 + 1] |= (((lab >> 1) & 1) << (7 - i))
            palette[j * 3 + 2] |= (((lab >> 2) & 1) << (7 - i))
            i += 1
            lab >>= 3
    return palette


class Normalize_image(object):
    """
    Normalize given tensor into given mean and standard dev
    
    Args:
        mean (float): Desired mean to substract from tensors
        std (float): Desired std to divide from tensors
    """

    def __init__(self, mean, std):
        assert isinstance(mean, (float))
        if isinstance(mean, float):
            self.mean = mean

        if isinstance(std, float):
            self.std = std

        self.normalize_1 = transforms.Normalize(self.mean, self.std)
        self.normalize_3 = transforms.Normalize([self.mean] * 3, [self.std] * 3)
        self.normalize_18 = transforms.Normalize([self.mean] * 18, [self.std] * 18)

    def __call__(self, image_tensor):
        if image_tensor.shape[0] == 1:
            return self.normalize_1(image_tensor)

        elif image_tensor.shape[0] == 3:
            return self.normalize_3(image_tensor)

        elif image_tensor.shape[0] == 18:
            return self.normalize_18(image_tensor)

        else:
            assert "Please set proper channels! Normlization implemented only for 1, 3 and 18"


def apply_transform(img):
    """
    Apply transforms to the image
    
    Args:
        img: Input PIL image
        
    Returns:
        Transformed tensor
    """
    transforms_list = []
    transforms_list += [transforms.ToTensor()]
    transforms_list += [Normalize_image(0.5, 0.5)]
    transform_rgb = transforms.Compose(transforms_list)
    return transform_rgb(img)


def generate_mask(input_image, net, palette, device='cpu', confidence_threshold=0.0):
    """
    Genera:
    1. Imagen original con overlay de segmentación multiclase (colores distintivos por clase).
    2. Lista de imágenes, cada una mostrando solo una clase segmentada sobre fondo verde croma.
    3. Diccionario con número de clases detectadas y centroide de cada clase.
    4. Imagen original con los centroides dibujados.

    Args:
        input_image (PIL.Image): Imagen de entrada.
        net (torch.nn.Module): Modelo de segmentación.
        palette (list): Paleta de colores para la segmentación.
        device (str): Dispositivo ('cpu' o 'cuda').
        confidence_threshold (float): Umbral de confianza para detección (0.0-1.0).
                                     Valores más bajos detectan más regiones.

    Returns:
        tuple: (overlay_img, [img_clase1, img_clase2, ...], info_dict, centroids_img)
    """
    img = input_image
    img_size = img.size
    img_resized = img.resize((768, 768), Image.BICUBIC)
    image_tensor = apply_transform(img_resized)
    image_tensor = torch.unsqueeze(image_tensor, 0)

    with torch.no_grad():
        output_tensor = net(image_tensor.to(device))
        # Apply softmax to get probabilities
        probs = F.softmax(output_tensor[0], dim=1)
        
        # Get the class with the maximum probability
        output_tensor = torch.max(probs, dim=1, keepdim=True)[1]
        output_tensor = torch.squeeze(output_tensor, dim=0)
        output_arr = output_tensor.cpu().numpy()[0]  # shape: (H, W)
        
        # Get raw probabilities for thresholding
        probs = probs.cpu().numpy()[0]  # shape: (C, H, W)

    # Resize mask to original size
    output_arr_resized = np.array(Image.fromarray(output_arr.astype(np.uint8), mode='L').resize(img_size, Image.NEAREST))
    
    # Resize probability maps to original size
    resized_probs = []
    for i in range(probs.shape[0]):
        prob_map = probs[i]
        resized_prob = np.array(Image.fromarray(prob_map, mode='F').resize(img_size, Image.BILINEAR))
        resized_probs.append(resized_prob)
    resized_probs = np.array(resized_probs)  # shape: (C, H, W)

    # 1. Overlay de segmentación multiclase
    overlay_img = img.convert('RGBA')
    overlay = Image.new('RGBA', img_size, (0, 0, 0, 0))
    class_colors = [
        (0, 0, 0, 0),        # fondo/transparente
        (255, 0, 0, 120),    # clase 1: rojo translúcido
        (0, 255, 0, 120),    # clase 2: verde translúcido
        (0, 0, 255, 120),    # clase 3: azul translúcido
    ]
    
    # Create thresholded masks
    thresholded_masks = []
    for cls in range(1, 4):
        # Apply threshold to probability map
        prob_map = resized_probs[cls]
        mask = (prob_map > confidence_threshold).astype(np.uint8) * 255
        thresholded_masks.append(mask)
        
        # Create overlay
        mask_img = Image.fromarray(mask, mode='L')
        color_img = Image.new('RGBA', img_size, class_colors[cls])
        overlay = Image.composite(color_img, overlay, mask_img)
    
    overlay_img = Image.alpha_composite(overlay_img, overlay)

    # 2. Imagen por clase con fondo verde croma (solo para clases detectadas)
    green_bg = (0, 255, 0)
    class_imgs = []
    class_indices = []  # Para mantener un registro de las clases detectadas
    
    for cls in range(1, 4):
        mask = thresholded_masks[cls-1]
        # Solo crear imagen si la clase es detectada (hay píxeles en la máscara)
        if np.any(mask):
            mask_img = Image.fromarray(mask, mode='L')
            fg = img.convert('RGBA')
            bg = Image.new('RGBA', img_size, green_bg + (255,))
            class_img = Image.composite(fg, bg, mask_img)
            class_imgs.append(class_img.convert('RGB'))
            class_indices.append(cls)  # Guardar el índice de clase

    # 3. Info de clases y centroides
    info = {'num_classes': 0, 'classes': {}}
    # 4. Imagen con centroides
    centroids_img = img.copy()
    # Convertir a cv2 para dibujar círculos
    centroids_img_cv = np.array(centroids_img)
    centroids_img_cv = centroids_img_cv[:, :, ::-1].copy()  # RGB a BGR para OpenCV
    solid_class_colors = [(0, 0, 255), (0, 255, 0), (255, 0, 0)]  # BGR en OpenCV
    
    for cls in range(1, 4):
        mask = thresholded_masks[cls-1] > 0
        if np.any(mask):
            ys, xs = np.where(mask)
            if len(xs) > 0 and len(ys) > 0:
                center_x = float(np.mean(xs))
                center_y = float(np.mean(ys))
                info['classes'][cls] = {'center': [center_x, center_y]}
                
                # Dibujar un círculo en el centroide
                cv2.circle(
                    centroids_img_cv, 
                    (int(center_x), int(center_y)), 
                    radius=10,  # Radio del círculo
                    color=solid_class_colors[cls-1],  # Color para esta clase (en BGR)
                    thickness=-1  # Relleno
                )
                # Agregar un borde para mejor visibilidad
                cv2.circle(
                    centroids_img_cv, 
                    (int(center_x), int(center_y)), 
                    radius=10,
                    color=(0, 0, 0),  # Borde negro
                    thickness=2
                )
                
                # Añadir texto con las coordenadas
                coord_text = f"({center_x:.1f}, {center_y:.1f})"
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.7
                text_size = cv2.getTextSize(coord_text, font, font_scale, 2)[0]
                
                # Posición de texto (ligeramente desplazado del centro)
                text_x = int(center_x) - text_size[0] // 2
                text_y = int(center_y) + 25  # 25 píxeles debajo del centro
                
                # Fondo del texto para mejor visibilidad
                cv2.rectangle(
                    centroids_img_cv,
                    (text_x - 5, text_y - text_size[1] - 5),
                    (text_x + text_size[0] + 5, text_y + 5),
                    (255, 255, 255),  # Fondo blanco
                    -1
                )
                
                # Texto de coordenadas
                cv2.putText(
                    centroids_img_cv,
                    coord_text,
                    (text_x, text_y),
                    font,
                    font_scale,
                    (0, 0, 0),  # Texto negro
                    2,
                    cv2.LINE_AA
                )
    
    info['num_classes'] = len(info['classes'])
    
    # Convertir de vuelta a PIL
    centroids_img = Image.fromarray(centroids_img_cv[:, :, ::-1])  # BGR a RGB

    # Devolver también las clases detectadas
    return overlay_img.convert('RGB'), class_imgs, info, centroids_img, class_indices


def check_or_download_model(file_path):
    """
    Check if model exists, if not download it
    
    Args:
        file_path: Path to save the model
    """
    if not os.path.exists(file_path):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        url = "https://drive.google.com/uc?id=11xTBALOeUkyuaK3l60CpkYHLTmv7k3dY"
        gdown.download(url, file_path, quiet=False)
        print("Model downloaded successfully.")
    else:
        print("Model already exists.")


def load_seg_model(checkpoint_path, device='cpu'):
    """
    Load segmentation model
    
    Args:
        checkpoint_path: Path to model checkpoint
        device: Device to load model on
        
    Returns:
        Loaded model
    """
    net = U2NET(in_ch=3, out_ch=4)
    check_or_download_model(checkpoint_path)
    net = load_checkpoint(net, checkpoint_path)
    net = net.to(device)
    net = net.eval()

    return net


def process_image(image_path, checkpoint_path='model/cloth_segm.pth', output_dir=None, 
                 use_cuda=False, save_overlay=False, save_centroids=False, confidence_threshold=0.0):
    """
    Process a single image with the cloth segmentation model
    
    Args:
        image_path: Path to the input image
        checkpoint_path: Path to the model checkpoint file
        output_dir: Directory to save output files
        use_cuda: Whether to use CUDA if available
        save_overlay: Whether to save the overlay image
        save_centroids: Whether to save the centroids image
        confidence_threshold: Threshold value for segmentation (0.0-1.0)
        
    Returns:
        dict: Paths to output files and segmentation info
    """
    device = 'cuda:0' if use_cuda and torch.cuda.is_available() else 'cpu'
    
    # Create output directory
    if output_dir is None:
        output_dir = 'output/process'
    os.makedirs(output_dir, exist_ok=True)
    
    # Load model
    model = load_seg_model(checkpoint_path, device=device)
    palette = get_palette(4)
    
    # Load and process image
    img = Image.open(image_path).convert('RGB')
    overlay_img, class_imgs, info, centroids_img, class_indices = generate_mask(img, net=model, palette=palette, device=device, confidence_threshold=confidence_threshold)
    
    # Prepare output paths dictionary
    output = {
        'class_paths': [],
        'class_indices': class_indices,
        'segmentation_info': info
    }
    
    # Save class images with simplified names
    for i, cimg in enumerate(class_imgs):
        cls = class_indices[i]
        cpath = os.path.join(output_dir, f'class{cls}.png')
        cimg.save(cpath)
        output['class_paths'].append(cpath)
    
    # Save overlay image (optional)
    if save_overlay:
        overlay_path = os.path.join(output_dir, 'overlay.png')
        overlay_img.save(overlay_path)
        output['overlay_path'] = overlay_path
    
    # Save centroids image (optional)
    if save_centroids:
        centroids_path = os.path.join(output_dir, 'centroids.png')
        centroids_img.save(centroids_path)
        output['centroids_path'] = centroids_path
    
    # Save JSON info
    json_path = os.path.join(output_dir, 'segmentation.json')
    with open(json_path, 'w') as f:
        json.dump(info, f, indent=2)
    output['json_path'] = json_path
    
    return output


def main(args):
    """
    Main function for command line usage
    
    Args:
        args: Command line arguments
    """
    device = 'cuda:0' if args.cuda else 'cpu'

    # Create an instance of the model
    model = load_seg_model(args.checkpoint_path, device=device)
    palette = get_palette(4)

    img = Image.open(args.image).convert('RGB')
    
    # Generate all images and info dictionary
    overlay_img, class_imgs, info, centroids_img, class_indices = generate_mask(img, net=model, palette=palette, device=device, confidence_threshold=args.threshold)
    
    # Create output folders
    if args.output:
        outdir = args.output
    else:
        outdir = 'output/process'
    os.makedirs(outdir, exist_ok=True)
    
    # Save class images (solo para clases detectadas)
    for i, cimg in enumerate(class_imgs):
        cls = class_indices[i]
        cpath = os.path.join(outdir, f'class{cls}.png')
        cimg.save(cpath)
        print(f"Clase {cls} guardada en: {cpath}")
    
    # Save overlay (optional)
    if args.save_overlay:
        overlay_path = os.path.join(outdir, 'overlay.png')
        overlay_img.save(overlay_path)
        print(f"Overlay guardado en: {overlay_path}")
    
    # Save image with centroids (optional)
    if args.save_centroids:
        centroids_path = os.path.join(outdir, 'centroids.png')
        centroids_img.save(centroids_path)
        print(f"Imagen con centroides guardada en: {centroids_path}")
    
    # Save JSON with centroid information
    json_path = os.path.join(outdir, 'segmentation.json')
    with open(json_path, 'w') as f:
        json.dump(info, f, indent=2)
    print(f"JSON guardado en: {json_path}")
    
    print(f"\nNúmero de clases detectadas: {info['num_classes']}")
    for cls, data in info['classes'].items():
        cls_name = ["", "Superior (rojo)", "Inferior (verde)", "Completo (azul)"][int(cls)]
        print(f"  Clase {cls} ({cls_name}): Centro en {data['center'][0]:.1f}, {data['center'][1]:.1f}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Cloth Segmentation Tool')
    parser.add_argument('--image', type=str, required=True, help='Path to the input image')
    parser.add_argument('--cuda', action='store_true', help='Enable CUDA (default: False)')
    parser.add_argument('--checkpoint_path', type=str, default='model/cloth_segm.pth', help='Path to the checkpoint file')
    parser.add_argument('--output', type=str, default=None, help='Output directory path')
    parser.add_argument('--save_overlay', action='store_true', help='Save overlay image')
    parser.add_argument('--save_centroids', action='store_true', help='Save centroids image')
    parser.add_argument('--threshold', type=float, default=0.0, help='Confidence threshold for segmentation (0.0-1.0)')
    args = parser.parse_args()

    main(args) 