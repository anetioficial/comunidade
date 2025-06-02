const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const db = require('../config');

// Inicializar cliente do Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN, 
    options: { timeout: 5000 }
});

// Inicializar objetos de API com o cliente
const preference = new Preference(client);
const payment = new Payment(client);

/**
 * Verifica se um cupom de desconto é válido e retorna o percentual de desconto
 * @param {String} code - Código do cupom
 * @returns {Promise<Object>} - Objeto com informações do cupom
 */
const validateDiscountCoupon = async (code) => {
  try {
    if (!code) return { valid: false, message: 'Código de cupom não fornecido' };
    
    const result = await db.query(
      `SELECT * FROM discount_coupons 
       WHERE code = $1 
       AND active = true 
       AND (valid_until IS NULL OR valid_until > NOW())
       AND (max_uses IS NULL OR current_uses < max_uses)`,
      [code]
    );
    
    if (result.rows.length === 0) {
      return { valid: false, message: 'Cupom inválido ou expirado' };
    }
    
    const coupon = result.rows[0];
    return { 
      valid: true, 
      discountPercentage: coupon.discount_percentage,
      couponId: coupon.id
    };
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    throw new Error('Falha ao validar cupom de desconto');
  }
};

/**
 * Incrementa o uso de um cupom de desconto
 * @param {Number} couponId - ID do cupom
 * @returns {Promise<void>}
 */
const incrementCouponUsage = async (couponId) => {
  try {
    await db.query(
      'UPDATE discount_coupons SET current_uses = current_uses + 1 WHERE id = $1',
      [couponId]
    );
  } catch (error) {
    console.error('Erro ao incrementar uso do cupom:', error);
    // Não lançamos erro aqui para não interromper o fluxo principal
  }
};

/**
 * Calcula o preço final com desconto
 * @param {Number} originalPrice - Preço original
 * @param {Number} discountPercentage - Percentual de desconto
 * @returns {Number} - Preço com desconto
 */
const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  return originalPrice * (1 - (discountPercentage / 100));
};

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * @param {Object} data - Dados para criação da preferência
 * @returns {Promise<Object>} - Objeto com informações da preferência criada
 */
const createPaymentPreference = async (data) => {
  try {
    const { 
      planName, 
      planPrice, 
      userName, 
      userEmail, 
      externalReference,
      discountPercentage = 0
    } = data;
    
    // Calcular preço com desconto
    const finalPrice = calculateDiscountedPrice(planPrice, discountPercentage);
    
    const preferenceData = {
      items: [
        { 
          title: `Plano ${planName} - ANETI`, 
          quantity: 1, 
          currency_id: "BRL", 
          unit_price: finalPrice 
        }
      ],
      payer: { 
        email: userEmail, 
        name: userName 
      },
      back_urls: { 
        success: `${process.env.FRONTEND_URL}/payment-success`, 
        failure: `${process.env.FRONTEND_URL}/payment-failure`, 
        pending: `${process.env.FRONTEND_URL}/payment-pending` 
      },
      auto_return: "approved",
      payment_methods: { 
        excluded_payment_types: [{ id: "ticket" }],
        installments: 12
      },
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook/mercadopago`,
      external_reference: externalReference,
    };
    
    const response = await preference.create({ body: preferenceData });
    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      externalReference: externalReference,
      finalPrice
    };
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error?.cause || error);
    throw new Error('Falha ao criar preferência de pagamento');
  }
};

/**
 * Verifica o status de um pagamento no Mercado Pago
 * @param {String} paymentId - ID do pagamento
 * @returns {Promise<Object>} - Objeto com informações do pagamento
 */
const checkPaymentStatus = async (paymentId) => {
  try {
    const paymentDetails = await payment.get({ id: paymentId });
    return {
      status: paymentDetails.status,
      externalReference: paymentDetails.external_reference,
      paymentMethod: paymentDetails.payment_method_id,
      paymentType: paymentDetails.payment_type_id,
      amount: paymentDetails.transaction_amount
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw new Error('Falha ao verificar status do pagamento');
  }
};

module.exports = {
  validateDiscountCoupon,
  incrementCouponUsage,
  calculateDiscountedPrice,
  createPaymentPreference,
  checkPaymentStatus
};
