const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
});

// Diretório de templates de e-mail
const TEMPLATES_DIR = path.join(__dirname, '../templates');

/**
 * Carrega e compila um template de e-mail
 * @param {String} templateName - Nome do arquivo de template (sem extensão)
 * @returns {Function} - Função compilada do Handlebars
 */
const loadTemplate = (templateName) => {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  return handlebars.compile(templateSource);
};

/**
 * Envia e-mail de confirmação de cadastro
 * @param {String} to - E-mail do destinatário
 * @param {String} name - Nome do destinatário
 * @returns {Promise} - Resultado do envio
 */
const sendRegistrationEmail = async (to, name) => {
  try {
    const template = loadTemplate('registration');
    const html = template({ name });
    
    const mailOptions = {
      from: `"ANETI" <${process.env.EMAIL_FROM || 'noreply@aneti.org.br'}>`,
      to,
      subject: 'Cadastro recebido - ANETI',
      html
    };
    
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar e-mail de cadastro:', error);
    throw new Error('Falha ao enviar e-mail de cadastro');
  }
};

/**
 * Envia e-mail de aprovação de cadastro
 * @param {String} to - E-mail do destinatário
 * @param {String} name - Nome do destinatário
 * @returns {Promise} - Resultado do envio
 */
const sendApprovalEmail = async (to, name) => {
  try {
    const template = loadTemplate('approval');
    const html = template({ name });
    
    const mailOptions = {
      from: `"ANETI" <${process.env.EMAIL_FROM || 'noreply@aneti.org.br'}>`,
      to,
      subject: 'Cadastro aprovado - ANETI',
      html
    };
    
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar e-mail de aprovação:', error);
    throw new Error('Falha ao enviar e-mail de aprovação');
  }
};

/**
 * Envia e-mail de reprovação de cadastro
 * @param {String} to - E-mail do destinatário
 * @param {String} name - Nome do destinatário
 * @param {String} justification - Justificativa da reprovação
 * @returns {Promise} - Resultado do envio
 */
const sendRejectionEmail = async (to, name, justification) => {
  try {
    const template = loadTemplate('rejection');
    const html = template({ name, justification });
    
    const mailOptions = {
      from: `"ANETI" <${process.env.EMAIL_FROM || 'noreply@aneti.org.br'}>`,
      to,
      subject: 'Cadastro não aprovado - ANETI',
      html
    };
    
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar e-mail de reprovação:', error);
    throw new Error('Falha ao enviar e-mail de reprovação');
  }
};

/**
 * Envia e-mail de confirmação de pagamento
 * @param {String} to - E-mail do destinatário
 * @param {String} name - Nome do destinatário
 * @param {Object} paymentDetails - Detalhes do pagamento
 * @returns {Promise} - Resultado do envio
 */
const sendPaymentConfirmationEmail = async (to, name, paymentDetails) => {
  try {
    const template = loadTemplate('payment');
    const html = template({ name, paymentDetails });
    
    const mailOptions = {
      from: `"ANETI" <${process.env.EMAIL_FROM || 'noreply@aneti.org.br'}>`,
      to,
      subject: 'Pagamento confirmado - ANETI',
      html
    };
    
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação de pagamento:', error);
    throw new Error('Falha ao enviar e-mail de confirmação de pagamento');
  }
};

module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPaymentConfirmationEmail
};
