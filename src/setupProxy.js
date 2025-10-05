const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', details: err.message });
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying: ${req.method} ${req.path} -> ${proxyReq.path}`);
      },
      timeout: 10000 // 10 seconds timeout
    })
  );
};
