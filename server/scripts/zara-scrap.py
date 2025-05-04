import requests
from bs4 import BeautifulSoup
import argparse

# Configuración de argparse para recibir la URL como argumento
parser = argparse.ArgumentParser(description='Extraer imágenes de productos de Zara')
parser.add_argument('url', help='URL del producto de Zara (ejemplo: https://zara.com/es/en/-P08727010.html)')
parser.add_argument('--output', '-o', help='Nombre del archivo para guardar la imagen (opcional)', default=None)
args = parser.parse_args()

# Usar la URL proporcionada como argumento
url = args.url
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
}

# 1. Obtener el HTML inicial de la página del producto
resp = requests.get(url, headers=headers)
html = resp.text

# 2. Analizar si hay una metaetiqueta de refresco para redirigir
soup = BeautifulSoup(html, "html.parser")
meta_refresh = soup.find('meta', attrs={'http-equiv': 'refresh'})
if meta_refresh:
    # Extraer la URL de redirección del contenido de la metaetiqueta
    content = meta_refresh.get('content', '')
    # El formato suele ser: '5; URL='/es/en/producto.html?param=...''
    if 'URL=' in content:
        redirect_url = content.split('URL=')[-1].strip().strip("'\"")
        # Completar la URL en caso de que sea relativa (comienza con '/')
        if redirect_url.startswith('/'):
            redirect_url = "https://www.zara.com" + redirect_url
        # Hacer la segunda petición HTTP a la URL real del producto
        resp = requests.get(redirect_url, headers=headers)
        html = resp.text

# 3. Parsear el HTML final para obtener la meta og:image
soup = BeautifulSoup(html, "html.parser")
og_image = soup.find('meta', attrs={'property': 'og:image'})
if og_image:
    image_url = og_image.get('content')
    print(image_url)
    
    # 4. Descargar la imagen si se especificó un nombre de archivo de salida
    if args.output:
        img_data = requests.get(image_url, headers=headers).content
        with open(args.output, "wb") as f:
            f.write(img_data)
        print(f"Imagen guardada como: {args.output}")
else:
    print("No se encontró la imagen del producto")