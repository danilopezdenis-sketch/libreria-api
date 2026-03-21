const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.use(express.json());

let db;
const uri = process.env.MONGODB_URI || "mongodb+srv://admin:kiva59_D@cluster0.dglndyo.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: true,
});

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db("libreria");
    console.log("Conectado a MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("Error MongoDB:", error.message);
    throw error;
  }
}

app.get("/", async (req, res) => {
  res.json({ message: "API funcionando" });
});

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