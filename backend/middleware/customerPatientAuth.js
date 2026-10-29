const jwt = require('jsonwebtoken');
const db = require('../config/db');
module.exports = async (req,res,next) => {
 try {
  const token = (req.headers.authorization || '').match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({message:'Patient login required'});
  const payload = jwt.verify(token,process.env.CUSTOMER_JWT_SECRET);
  if (payload.type !== 'customer' || !Number.isInteger(Number(payload.id))) return res.status(403).json({message:'Patient access only'});
  const [[patient]] = await db.query("SELECT id FROM customers WHERE id=? AND status='active' LIMIT 1",[payload.id]);
  if (!patient) return res.status(401).json({message:'Patient account inactive'});
  req.patientId = patient.id; next();
 } catch(e) { return res.status(401).json({message:'Invalid or expired patient session'}); }
};
