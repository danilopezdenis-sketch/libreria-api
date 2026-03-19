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

async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

startServer();