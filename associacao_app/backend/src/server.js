require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./config");
// Import specific functionalities and the config class from Mercado Pago SDK
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN, 
    options: { timeout: 5000 } // Optional timeout
});
// Initialize API objects with the client
const preference = new Preference(client);
const payment = new Payment(client);

app.use(express.json()); // Middleware to parse JSON bodies

// Temporary storage for pending registrations (In-memory - **Not suitable for production!** Use Redis or a DB table)
const pendingRegistrations = {};

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        console.error("JWT Verification Error:", err);
        return res.sendStatus(403); // Invalid token
    }
    req.user = user; // Add user payload to request object
    console.log("Authenticated user:", req.user);
    next(); // pass the execution off to whatever request the client intended
  });
};

// --- Authentication Routes ---

// Login Route (Existing)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }
  try {
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "Credenciais inválidas." });
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Credenciais inválidas." });
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login bem-sucedido!", token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Registration Route - Step 1: Initiate Payment (Updated with new SDK usage)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: "Formato de email inválido." });

  let externalReference; // Define here to be accessible in catch block
  try {
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) return res.status(409).json({ message: "Este email já está cadastrado." });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    externalReference = `REGISTRATION_${email}_${Date.now()}`;
    pendingRegistrations[externalReference] = { name, email, passwordHash };
    console.log("Pending registration stored:", externalReference, pendingRegistrations[externalReference]);

    const preferenceData = {
        items: [{ title: "Taxa de Inscrição - Associação Profissional", quantity: 1, currency_id: "BRL", unit_price: 50.00 }], // Example price
        payer: { email: email, name: name },
        back_urls: { success: "http://localhost:YOUR_FRONTEND_PORT/payment-success", failure: "http://localhost:YOUR_FRONTEND_PORT/payment-failure", pending: "http://localhost:YOUR_FRONTEND_PORT/payment-pending" },
        auto_return: "approved",
        payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "debit_card" }] },
        notification_url: `https://YOUR_BACKEND_DOMAIN/api/payments/webhook/mercadopago`, // **Needs public URL**
        external_reference: externalReference,
    };
    
    // Use the preference object initialized with the client
    const response = await preference.create({ body: preferenceData });
    console.log("Mercado Pago Preference Response:", response);
    res.status(201).json({ message: "Preferência de pagamento criada.", preferenceId: response.id, init_point: response.init_point, externalReference: externalReference });

  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error?.cause || error);
    if (externalReference && pendingRegistrations[externalReference]) delete pendingRegistrations[externalReference];
    res.status(500).json({ message: "Erro ao iniciar o processo de pagamento.", error: error?.cause || error });
  }
});

// --- User Profile Routes ---

// Get User Profile (Protected Route)
app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await db.query("SELECT id, name, email, created_at FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado." });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar perfil." });
  }
});

// Update User Profile (Protected Route)
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;
  if (!name) return res.status(400).json({ message: "O nome é obrigatório para atualização." });
  try {
    const result = await db.query("UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at", [name, userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado para atualização." });
    res.json({ message: "Perfil atualizado com sucesso!", user: result.rows[0] });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor ao atualizar perfil." });
  }
});

// --- Posts Routes ---

// Create Post (Protected Route)
app.post("/api/posts", authenticateToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.userId;
    if (!content) return res.status(400).json({ message: "O conteúdo da publicação é obrigatório." });
    try {
        const result = await db.query("INSERT INTO posts (content, user_id) VALUES ($1, $2) RETURNING id, content, user_id, created_at", [content, userId]);
        res.status(201).json({ message: "Publicação criada com sucesso!", post: result.rows[0] });
    } catch (error) {
        console.error("Erro ao criar publicação:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar publicação." });
    }
});

// Get Posts (Protected Route - Simple version, lists latest posts)
app.get("/api/posts", authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.id, p.content, p.created_at, u.id as user_id, u.name as user_name 
             FROM posts p 
             JOIN users u ON p.user_id = u.id 
             ORDER BY p.created_at DESC 
             LIMIT 50`, // Limit to latest 50 posts
             []
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar publicações:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar publicações." });
    }
});


// --- Payment Webhook Route ---

// Webhook Route - Step 2: Confirm Payment and Create User (Updated with new SDK usage)
app.post("/api/payments/webhook/mercadopago", async (req, res) => {
  console.log("Webhook recebido:", req.query, req.body);
  res.status(200).send("Webhook recebido"); 
  try {
    if (req.query.type === "payment") {
      const paymentId = req.query["data.id"] || req.body?.data?.id;
      if (!paymentId) { console.warn("Webhook sem ID de pagamento."); return; }
      console.log("Processando pagamento ID:", paymentId);
      
      // Use the payment object initialized with the client
      const paymentDetails = await payment.get({ id: paymentId });
      console.log("Detalhes do Pagamento:", paymentDetails);

      if (paymentDetails.status === "approved") {
        const externalReference = paymentDetails.external_reference;
        console.log("Pagamento aprovado para external_reference:", externalReference);
        const userData = pendingRegistrations[externalReference];
        if (userData) {
          console.log("Dados do usuário pendente encontrados:", userData);
          const { name, email, passwordHash } = userData;
          const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);
          if (existingUser.rows.length > 0) {
              console.warn(`Usuário com email ${email} já existe.`);
              delete pendingRegistrations[externalReference];
              return; 
          }
          const newUserResult = await db.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id", [name, email, passwordHash]);
          console.log(`Usuário ${email} criado com ID: ${newUserResult.rows[0].id}.`);
          delete pendingRegistrations[externalReference];
          console.log("Registro pendente removido:", externalReference);
        } else {
          console.warn("Dados de usuário pendente não encontrados para:", externalReference);
        }
      } else {
        console.log(`Pagamento ${paymentId} não aprovado. Status: ${paymentDetails.status}`);
        const externalReference = paymentDetails.external_reference;
        if (paymentDetails.status !== 'pending' && pendingRegistrations[externalReference]) {
            console.log("Removendo registro pendente:", externalReference);
            delete pendingRegistrations[externalReference];
        }
      }
    }
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});

