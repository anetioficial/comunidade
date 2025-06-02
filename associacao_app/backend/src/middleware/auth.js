const jwt = require('jsonwebtoken');
const db = require('../config');

/**
 * Middleware para autenticação de token JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.status(401).json({ message: "Autenticação necessária" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ message: "Token inválido ou expirado" });
    }
    req.user = user; // Add user payload to request object
    next();
  });
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ message: "Acesso restrito a administradores" });
    }
    
    next();
  } catch (error) {
    console.error("Erro ao verificar permissões de administrador:", error);
    res.status(500).json({ message: "Erro ao verificar permissões" });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};
