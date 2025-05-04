export async function run(modelUrl, garmentUrl) {
  const url = `${process.env.FASHNIA_API_URL}/run`;
  const token = process.env.FASHNIA_API_KEY;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_image: modelUrl,
      garment_image: garmentUrl,
    })
  });

  if (!response.ok) {
    throw new Error(`Error generando prueba: ${JSON.stringify(await response.json())}`);  
  }

  return await response.json();
}

export async function getImage(id) {
  let retryCount = 0;
  const maxRetries = 5; 

  while (retryCount < maxRetries) {
    try {
      const token = process.env.FASHNIA_API_KEY;

      const response = await fetch(`${process.env.FASHNIA_API_URL}/status/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Error al verificar estado: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Error: ${data.error}`);
      }

      if (data.status === 'completed') {
        if (data.output && data.output.length > 0) {
          return data.output[0];  
        } else {
          throw new Error('No se recibieron imágenes en la respuesta');
        }
      } else if (data.status === 'failed') {
        throw new Error('El procesamiento de imagen ha fallado');
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error('Se ha excedido el tiempo máximo de espera');
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); 
      }
    } catch (error) {
      throw error;  
    }
  }
};
