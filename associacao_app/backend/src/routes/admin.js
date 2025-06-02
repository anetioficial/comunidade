const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const storageService = require('../services/storage');
const emailService = require('../services/email');

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (req, file, cb) => {
    // Tipos de arquivo permitidos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas PDF, JPEG, PNG, DOC e DOCX são aceitos.'));
    }
  }
});

// Listar todos os registros pendentes - Admin
router.get('/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, p.name as plan_name, p.price as plan_price 
       FROM registrations r
       LEFT JOIN plans p ON r.plan_id = p.id
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC`,
      []
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar registros pendentes:', error);
    res.status(500).json({ message: 'Erro interno ao listar registros pendentes' });
  }
});

// Obter detalhes de um registro específico - Admin
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar informações do registro
    const registrationResult = await db.query(
      `SELECT r.*, p.name as plan_name, p.price as plan_price 
       FROM registrations r
       LEFT JOIN plans p ON r.plan_id = p.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (registrationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    
    const registration = registrationResult.rows[0];
    
    // Buscar documentos associados
    const documents = await storageService.listRegistrationDocuments(id);
    
    res.json({
      registration,
      documents
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do registro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar detalhes do registro' });
  }
});

// Aprovar um registro - Admin
router.post('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    
    await client.query('BEGIN');
    
    // Verificar se o registro existe e está pendente
    const checkResult = await client.query(
      'SELECT * FROM registrations WHERE id = $1 AND status = $2',
      [id, 'pending']
    );
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Registro pendente não encontrado' });
    }
    
    const registration = checkResult.rows[0];
    
    // Verificar se o pagamento foi aprovado (para planos pagos)
    const planResult = await client.query('SELECT is_public FROM plans WHERE id = $1', [registration.plan_id]);
    const isPlanPublic = planResult.rows[0]?.is_public || false;
    
    if (!isPlanPublic && registration.payment_status !== 'approved') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Não é possível aprovar um registro com pagamento pendente' });
    }
    
    // Atualizar status do registro
    await client.query(
      'UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['approved', id]
    );
    
    // Registrar aprovação
    await client.query(
      'INSERT INTO approvals (registration_id, approved_by, status) VALUES ($1, $2, $3)',
      [id, adminId, 'approved']
    );
    
    // Criar usuário a partir do registro
    const newUserResult = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [registration.name, registration.email, registration.password_hash]
    );
    
    const userId = newUserResult.rows[0].id;
    
    // Transferir documentos do registro para o usuário
    await client.query(
      'UPDATE documents SET user_id = $1, registration_id = NULL WHERE registration_id = $2',
      [userId, id]
    );
    
    await client.query('COMMIT');
    
    // Enviar e-mail de aprovação
    await emailService.sendApprovalEmail(registration.email, registration.name);
    
    res.json({ message: 'Registro aprovado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao aprovar registro:', error);
    res.status(500).json({ message: 'Erro interno ao aprovar registro' });
  } finally {
    client.release();
  }
});

// Rejeitar um registro - Admin
router.post('/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    const { justification } = req.body;
    const adminId = req.user.userId;
    
    if (!justification) {
      return res.status(400).json({ message: 'Justificativa é obrigatória para rejeição' });
    }
    
    await client.query('BEGIN');
    
    // Verificar se o registro existe e está pendente
    const checkResult = await client.query(
      'SELECT * FROM registrations WHERE id = $1 AND status = $2',
      [id, 'pending']
    );
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Registro pendente não encontrado' });
    }
    
    const registration = checkResult.rows[0];
    
    // Atualizar status do registro
    await client.query(
      'UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['rejected', id]
    );
    
    // Registrar rejeição
    await client.query(
      'INSERT INTO approvals (registration_id, approved_by, status, justification) VALUES ($1, $2, $3, $4)',
      [id, adminId, 'rejected', justification]
    );
    
    await client.query('COMMIT');
    
    // Enviar e-mail de rejeição
    await emailService.sendRejectionEmail(registration.email, registration.name, justification);
    
    res.json({ message: 'Registro rejeitado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao rejeitar registro:', error);
    res.status(500).json({ message: 'Erro interno ao rejeitar registro' });
  } finally {
    client.release();
  }
});

// Obter documento de um registro - Admin
router.get('/:id/documents/:documentId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    // Verificar se o documento pertence ao registro
    const checkResult = await db.query(
      'SELECT * FROM documents WHERE id = $1 AND registration_id = $2',
      [documentId, id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }
    
    const document = await storageService.getDocument(documentId);
    
    res.set({
      'Content-Type': document.mime_type,
      'Content-Disposition': `inline; filename="${document.file_name}"`,
    });
    
    res.send(document.content);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ message: 'Erro interno ao buscar documento' });
  }
});

module.exports = router;
