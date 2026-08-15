// Next.js API route for proxying requests to Laravel backend
export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  
  // Laravel backend URL
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  
  try {
    const url = `${backendUrl}/api/${apiPath}`;
    
    // Forward headers from the client
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': `http://localhost:${process.env.PORT || 3000}`,
      'Referer': `http://localhost:${process.env.PORT || 3000}/`,
    };

    // Forward cookies for session-based authentication
    if (req.headers.cookie) {
      headers.Cookie = req.headers.cookie;
    }

    // Forward CSRF token if present
    if (req.headers['x-csrf-token']) {
      headers['X-CSRF-TOKEN'] = req.headers['x-csrf-token'];
    }

    // Custom signature header for API security
    if (process.env.API_SIGNATURE) {
      headers['X-Signature'] = process.env.API_SIGNATURE;
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.text();

    // Forward response headers (especially Set-Cookie for sessions)
    Object.entries(response.headers.raw()).forEach(([key, values]) => {
      values.forEach(value => {
        res.setHeader(key, value);
      });
    });

    // Set status and send response
    res.status(response.status);
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
    
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}