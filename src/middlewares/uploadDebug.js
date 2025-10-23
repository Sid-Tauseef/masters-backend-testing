// Debug middleware to check what multer is receiving
const uploadDebug = (req, res, next) => {
  console.log('🔍 UPLOAD DEBUG MIDDLEWARE:');
  console.log('📦 Request headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });
  console.log('📁 Request file:', req.file);
  console.log('📝 Request body keys:', Object.keys(req.body));
  
  // Log FormData fields
  Object.keys(req.body).forEach(key => {
    console.log(`   ${key}:`, req.body[key]);
  });
  
  next();
};

module.exports = uploadDebug;