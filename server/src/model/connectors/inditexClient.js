
export async function getToken() {
    const credentials = `${process.env.INDITEX_USER}:${process.env.INDITEX_SECRET}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const params = new URLSearchParams();
    params.set('grant_type', 'client_credentials');
    params.set('scope', 'technology.catalog.read');

    const req = {
        method: 'POST',
        headers: {
            "User-Agent": "OpenPlatform/1.0",
            "Authorization": `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      };
  
    const response = await fetch(process.env.INDITEX_OAUTH_URL, req);
  
    if (!response.ok) {
      throw new Error(`Error obteniendo token: ${response.statusText}`);
    }
  
    return await response.json();
  }
  
export async function search(token, imageUrl) {
    const url = `${process.env.INDITEX_API_URL}/pubvsearch/products?image=${imageUrl}`;
  
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    if (!response.ok) {
      throw new Error(`Error buscando producto: ${response.statusText}`);
    }
  
    return await response.json();
  }

export async function findProducts(token, params) {
    const url = `${process.env.INDITEX_API_URL}/searchpmpa/products?${new URLSearchParams(params).toString()}`;
  
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  
    if (!response.ok) {
      throw new Error(`Error buscando producto: ${response.statusText}`);
    }
  
    return await response.json();
  }