const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI || "mongodb+srv://admin:kiva59_D@cluster0.dglndyo.mongodb.net/libreria?retryWrites=true&w=majority";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error MongoDB:", error.message);
    throw error;
  }
};

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando con Mongoose" });
});

// GET /api/autores
app.get("/api/autores", async (req, res) => {
  try {
    await connectDB();
    
    const { nacionalidad } = req.query;
    let query = {};
    if (nacionalidad) query.nacionalidad = nacionalidad;
    
    const db = mongoose.connection.db;
    const autores = await db.collection("autores").find(query).toArray();
    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/libros
app.get("/api/libros", async (req, res) => {
  try {
    await connectDB();
    
    const { sort } = req.query;
    const db = mongoose.connection.db;
    
    const options = sort === "titulo" ? { sort: { titulo: 1 } } : {};
    const libros = await db.collection("libros").find({}, options).toArray();
    
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`Servidor en http://localhost:${PORT}`);
  });
}