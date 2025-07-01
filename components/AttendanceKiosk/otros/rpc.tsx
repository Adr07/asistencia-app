export async function rpcCall<T>(
  service: 'common' | 'object',
  method: string,
  args: any[],
  rpcUrl: string
): Promise<T> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service,
          method,
          args,
        },
        id: Math.floor(Math.random() * 100000),
      }),
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Respuesta no es JSON válido: ' + text);
    }
    if (!response.ok) {
      throw new Error('HTTP error: ' + response.status + ' ' + text);
    }
    if (data.error) {
      throw new Error('Odoo error: ' + JSON.stringify(data.error));
    }
    return data.result;
  } catch (err) {
    throw err;
  }
}
