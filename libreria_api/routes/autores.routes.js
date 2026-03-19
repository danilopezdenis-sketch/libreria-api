const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { nacionalidad } = req.query;
    
    let query = {};
    if (nacionalidad) {
      query.nacionalidad = nacionalidad;
    }
    
    const autores = await db.collection("autores").find(query).toArray();
    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const autor = await db.collection("autores").findOne({ referencia: req.params.id });
    
    if (!autor) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }
    
    res.json(autor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDB();
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
    
    const result = await db.collection("autores").insertOne(nuevoAutor);
    res.status(201).json({ ...nuevoAutor, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { nombre, nacionalidad, fechaNacimiento, imagenUrl } = req.body;
    
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (nacionalidad) updateData.nacionalidad = nacionalidad;
    if (fechaNacimiento) updateData.fechaNacimiento = new Date(fechaNacimiento);
    if (imagenUrl) updateData.imagenUrl = imagenUrl;
    
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

router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    
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

router.get("/:id/libros", async (req, res) => {
  try {
    const db = getDB();
    
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

module.exports = router;
