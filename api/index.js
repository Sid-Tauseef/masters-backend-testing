const app = require('../src/server.js');

// Export the Express app as a Vercel function
module.exports = (req, res) => {
  // Add request logging for debugging
  console.log(`📝 ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`);
  
  // Handle the request with Express
  app(req, res);
};

// For development/testing
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}