const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const db = getDB();
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

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const libro = await db.collection("libros").findOne({ referencia: req.params.id });
    
    if (!libro) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    
    res.json(libro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const { referencia, titulo, genero, anyoPublicacion, autor, imagenUrl } = req.body;
    
    if (!titulo || !autor) {
      return res.status(400).json({ error: "El título y el autor son requeridos" });
    }
    
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

router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { titulo, genero, anyoPublicacion, autor, imagenUrl } = req.body;
    
    const updateData = {};
    if (titulo) updateData.titulo = titulo;
    if (genero) updateData.genero = genero;
    if (anyoPublicacion) updateData.anyoPublicacion = anyoPublicacion;
    if (imagenUrl) updateData.imagenUrl = imagenUrl;
    
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

router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("libros").deleteOne({ referencia: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    
    res.json({ message: "Libro eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;