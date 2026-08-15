// Next.js API route for Sanctum CSRF cookie
export default async function handler(req, res) {
  const { path } = req.query;
  const sanctumPath = Array.isArray(path) ? path.join('/') : path;
  
  // Laravel backend URL
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  
  try {
    const url = `${backendUrl}/sanctum/${sanctumPath}`;
    
    // Forward headers for CSRF cookie request
    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': `http://localhost:${process.env.PORT || 3000}`,
      'Referer': `http://localhost:${process.env.PORT || 3000}/`,
    };

    // Forward existing cookies
    if (req.headers.cookie) {
      headers.Cookie = req.headers.cookie;
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
    });

    // Forward all response headers (especially Set-Cookie)
    Object.entries(response.headers.raw()).forEach(([key, values]) => {
      values.forEach(value => {
        res.setHeader(key, value);
      });
    });

    // Set status and send response
    res.status(response.status);
    
    if (response.status === 204) {
      // CSRF cookie endpoint typically returns 204 No Content
      res.end();
    } else {
      const data = await response.text();
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch {
        res.send(data);
      }
    }
    
  } catch (error) {
    console.error('Sanctum Proxy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}