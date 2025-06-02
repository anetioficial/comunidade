const express = require('express');
const router = express.Router();
const db = require('../config');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Listar todos os planos ativos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, price, is_public, description FROM plans WHERE active = true ORDER BY price ASC',
      []
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ message: 'Erro interno ao listar planos' });
  }
});

// Obter detalhes de um plano específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, price, is_public, description FROM plans WHERE id = $1 AND active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({ message: 'Erro interno ao buscar plano' });
  }
});

// --- Rotas administrativas (protegidas) ---

// Listar todos os planos (incluindo inativos) - Admin
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM plans ORDER BY price ASC',
      []
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar todos os planos:', error);
    res.status(500).json({ message: 'Erro interno ao listar planos' });
  }
});

// Criar novo plano - Admin
router.post('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, price, isPublic, description } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }
    
    const result = await db.query(
      'INSERT INTO plans (name, price, is_public, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, isPublic || false, description || '']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro interno ao criar plano' });
  }
});

// Atualizar plano existente - Admin
router.put('/admin/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, isPublic, description, active } = req.body;
    
    // Verificar se o plano existe
    const checkResult = await db.query('SELECT id FROM plans WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Construir query dinâmica com base nos campos fornecidos
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      queryParams.push(name);
    }
    
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      queryParams.push(price);
    }
    
    if (isPublic !== undefined) {
      updateFields.push(`is_public = $${paramIndex++}`);
      queryParams.push(isPublic);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      queryParams.push(description);
    }
    
    if (active !== undefined) {
      updateFields.push(`active = $${paramIndex++}`);
      queryParams.push(active);
    }
    
    // Adicionar updated_at
    updateFields.push(`updated_at = NOW()`);
    
    // Se não houver campos para atualizar
    if (updateFields.length === 1) {
      return res.status(400).json({ message: 'Nenhum campo fornecido para atualização' });
    }
    
    // Adicionar ID como último parâmetro
    queryParams.push(id);
    
    const query = `
      UPDATE plans 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar plano' });
  }
});

// Excluir plano (soft delete) - Admin
router.delete('/admin/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o plano existe
    const checkResult = await db.query('SELECT id FROM plans WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Soft delete (marcar como inativo)
    await db.query(
      'UPDATE plans SET active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Plano desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar plano:', error);
    res.status(500).json({ message: 'Erro interno ao desativar plano' });
  }
});

module.exports = router;
