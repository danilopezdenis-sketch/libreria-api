require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/db");

const autoresRoutes = require("./routes/autores.routes");
const librosRoutes = require("./routes/libros.routes");

const app = express();

app.use(express.json());

app.use("/api/autores", autoresRoutes);
app.use("/api/libros", librosRoutes);

const PORT = process.env.PORT || 3000;

// Conectar a la base de datos al inicio
let dbConnected = false;

app.use(async (req, res, next) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  next();
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

// Para Vercel (serverless)
module.exports = app;