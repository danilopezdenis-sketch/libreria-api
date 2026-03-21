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
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error MongoDB:", error.message);
    throw error;
  }
};

app.get("/", (req, res) => {
  res.json({ message: "API REST Biblioteca - Todos los endpoints funcionando" });
});

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

app.get("/api/autores/:id", async (req, res) => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const autor = await db.collection("autores").findOne({ referencia: req.params.id });
    
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }
    
    res.json(autor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/autores", async (req, res) => {
  try {
    await connectDB();
    const { referencia, nombre, nacionalidad, fechaNacimiento, imagenUrl } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }
    
    const nuevoAutor = {
      referencia: referencia || `AUT${Date.now()}`,
      nombre,
      nacionalidad,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      imagenUrl
    };
    
    const db = mongoose.connection.db;
    const result = await db.collection("autores").insertOne(nuevoAutor);
    res.status(201).json({ ...nuevoAutor, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/autores/:id", async (req, res) => {
  try {
    await connectDB();
    const { nombre, nacionalidad, fechaNacimiento, imagenUrl } = req.body;
    
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (nacionalidad) updateData.nacionalidad = nacionalidad;
    if (fechaNacimiento) updateData.fechaNacimiento = new Date(fechaNacimiento);
    if (imagenUrl) updateData.imagenUrl = imagenUrl;
    
    const db = mongoose.connection.db;
    const result = await db.collection("autores").updateOne(
      { referencia: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }
    
    res.json({ message: "Autor actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/autores/:id", async (req, res) => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    
    const librosDelAutor = await db.collection("libros").countDocuments({ autor: req.params.id });
    if (librosDelAutor > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar el autor porque tiene ${librosDelAutor} libro(s) asociado(s)` 
      });
    }
    
    const result = await db.collection("autores").deleteOne({ referencia: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }
    
    res.json({ message: "Autor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/autores/:id/libros", async (req, res) => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    
    const autor = await db.collection("autores").findOne({ referencia: req.params.id });
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }
    
    const libros = await db.collection("libros").find({ autor: req.params.id }).toArray();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get("/api/libros/:id", async (req, res) => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const libro = await db.collection("libros").findOne({ referencia: req.params.id });
    
    if (!libro) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    
    res.json(libro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/libros", async (req, res) => {
  try {
    await connectDB();
    const { referencia, titulo, genero, anyoPublicacion, autor, imagenUrl } = req.body;
    
    if (!titulo || !autor) {
      return res.status(400).json({ error: "El título y el autor son requeridos" });
    }
    
    const db = mongoose.connection.db;
    const autorExiste = await db.collection("autores").findOne({ referencia: autor });
    if (!autorExiste) {
      return res.status(400).json({ error: "El autor especificado no existe" });
    }
    
    const nuevoLibro = {
      referencia: referencia || `LIB${Date.now()}`,
      titulo,
      genero,
      anyoPublicacion,
      autor,
      imagenUrl
    };
    
    const result = await db.collection("libros").insertOne(nuevoLibro);
    res.status(201).json({ ...nuevoLibro, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/libros/:id", async (req, res) => {
  try {
    await connectDB();
    const { titulo, genero, anyoPublicacion, autor, imagenUrl } = req.body;
    
    const updateData = {};
    if (titulo) updateData.titulo = titulo;
    if (genero) updateData.genero = genero;
    if (anyoPublicacion) updateData.anyoPublicacion = anyoPublicacion;
    if (imagenUrl) updateData.imagenUrl = imagenUrl;
    
    const db = mongoose.connection.db;
    
    if (autor) {
      const autorExiste = await db.collection("autores").findOne({ referencia: autor });
      if (!autorExiste) {
        return res.status(400).json({ error: "El autor especificado no existe" });
      }
      updateData.autor = autor;
    }
    
    const result = await db.collection("libros").updateOne(
      { referencia: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    
    res.json({ message: "Libro actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/libros/:id", async (req, res) => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const result = await db.collection("libros").deleteOne({ referencia: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    
    res.json({ message: "Libro eliminado correctamente" });
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