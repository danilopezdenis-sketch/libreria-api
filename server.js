const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

let db;
const uri = process.env.MONGODB_URI || "mongodb+srv://admin:kiva59_D@cluster0.dglndyo.mongodb.net/libreria";

// Opciones de conexión para Vercel
const mongoOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

async function connectDB() {
  if (db) return db;
  try {
    const client = new MongoClient(uri, mongoOptions);
    await client.connect();
    db = client.db("libreria");
    console.log("Conectado a MongoDB");
    return db;
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    throw error;
  }
}

// Ruta de prueba
app.get("/", async (req, res) => {
  res.json({ message: "API funcionando" });
});

// Rutas de autores
app.get("/api/autores", async (req, res) => {
  try {
    const database = await connectDB();
    const { nacionalidad } = req.query;
    
    let query = {};
    if (nacionalidad) {
      query.nacionalidad = nacionalidad;
    }
    
    const autores = await database.collection("autores").find(query).toArray();
    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de libros
app.get("/api/libros", async (req, res) => {
  try {
    const database = await connectDB();
    const { sort } = req.query;
    
    let query = database.collection("libros").find({});
    
    if (sort === "titulo") {
      query = query.sort({ titulo: 1 });
    }
    
    const libros = await query.toArray();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
  });
}