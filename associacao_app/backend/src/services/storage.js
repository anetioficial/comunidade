const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config');

// Diretório base para armazenamento de documentos
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Garantir que o diretório de uploads exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Salva um arquivo no sistema de arquivos e registra no banco de dados
 * @param {Object} file - Objeto do arquivo (Buffer, nome, mimetype, etc)
 * @param {Number} userId - ID do usuário que está enviando o documento
 * @param {String} documentType - Tipo de documento ('id_document', 'experience_document', etc)
 * @returns {Promise<Object>} - Objeto com informações do documento salvo
 */
const saveDocument = async (file, userId, documentType) => {
  try {
    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Salvar arquivo no sistema de arquivos
    fs.writeFileSync(filePath, file.buffer);
    
    // Registrar no banco de dados
    const result = await db.query(
      `INSERT INTO documents (user_id, document_type, file_name, file_path, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, document_type, file_name, uploaded_at`,
      [userId, documentType, file.originalname, fileName, file.mimetype, file.size]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    throw new Error('Falha ao salvar documento');
  }
};

/**
 * Salva um documento para um registro pendente
 * @param {Object} file - Objeto do arquivo
 * @param {Number} registrationId - ID do registro pendente
 * @param {String} documentType - Tipo de documento
 * @returns {Promise<Object>} - Objeto com informações do documento salvo
 */
const saveRegistrationDocument = async (file, registrationId, documentType) => {
  try {
    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Salvar arquivo no sistema de arquivos
    fs.writeFileSync(filePath, file.buffer);
    
    // Registrar no banco de dados (associado ao registro pendente)
    const result = await db.query(
      `INSERT INTO documents (registration_id, document_type, file_name, file_path, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, document_type, file_name, uploaded_at`,
      [registrationId, documentType, file.originalname, fileName, file.mimetype, file.size]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao salvar documento de registro:', error);
    throw new Error('Falha ao salvar documento de registro');
  }
};

/**
 * Recupera um documento pelo ID
 * @param {Number} documentId - ID do documento
 * @returns {Promise<Object>} - Objeto com informações e conteúdo do documento
 */
const getDocument = async (documentId) => {
  try {
    const result = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [documentId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Documento não encontrado');
    }
    
    const document = result.rows[0];
    const filePath = path.join(UPLOAD_DIR, document.file_path);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo não encontrado no sistema');
    }
    
    const fileContent = fs.readFileSync(filePath);
    
    return {
      ...document,
      content: fileContent
    };
  } catch (error) {
    console.error('Erro ao recuperar documento:', error);
    throw new Error('Falha ao recuperar documento');
  }
};

/**
 * Lista documentos de um usuário
 * @param {Number} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de documentos do usuário
 */
const listUserDocuments = async (userId) => {
  try {
    const result = await db.query(
      'SELECT id, document_type, file_name, mime_type, file_size, uploaded_at FROM documents WHERE user_id = $1',
      [userId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Erro ao listar documentos do usuário:', error);
    throw new Error('Falha ao listar documentos');
  }
};

/**
 * Lista documentos de um registro pendente
 * @param {Number} registrationId - ID do registro pendente
 * @returns {Promise<Array>} - Lista de documentos do registro
 */
const listRegistrationDocuments = async (registrationId) => {
  try {
    const result = await db.query(
      'SELECT id, document_type, file_name, mime_type, file_size, uploaded_at FROM documents WHERE registration_id = $1',
      [registrationId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Erro ao listar documentos do registro:', error);
    throw new Error('Falha ao listar documentos do registro');
  }
};

module.exports = {
  saveDocument,
  saveRegistrationDocument,
  getDocument,
  listUserDocuments,
  listRegistrationDocuments
};
