const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI || "mongodb+srv://admin:kiva59_D@cluster0.dglndyo.mongodb.net/libreria?retryWrites=true&w=majority";

// Conectar con Mongoose
mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB con Mongoose"))
  .catch(err => console.error("❌ Error:", err.message));

const db = mongoose.connection;

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando con Mongoose" });
});

// GET /api/autores
app.get("/api/autores", async (req, res) => {
  try {
    const { nacionalidad } = req.query;
    let query = {};
    if (nacionalidad) query.nacionalidad = nacionalidad;
    
    const autores = await db.collection("autores").find(query).toArray();
    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/libros
app.get("/api/libros", async (req, res) => {
  try {
    const { sort } = req.query;
    let query = db.collection("libros").find({});
    
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
    console.log(`Servidor en http://localhost:${PORT}`);
  });
}