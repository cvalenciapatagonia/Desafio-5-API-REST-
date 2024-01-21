import express from 'express'
const app = express()
app.listen(3000, console.log('Server ON'))

app.use(express.json())

import { joyasHATEOAS, obtenerJoyas, obtenerJoyasPorFiltros } from "./consultas.js"


//? Implementacion de middleware para generar informes o reportes de alguna actividad o evento específico que ocurra en cada una de las rutas.

const reportarConsulta = async (req, res, next) => {
  const parametros = req.params 
  const querys = req.query
  const url = req.url
  console.log(`
    Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url}
    con los parametros y querys:
    `, parametros, querys)
    next() 
}


//? RUTAS API y uso de try catch para capturar los posibles errores durante consultas y la lógica de cada ruta creada.  

app.get("/inventarioHateoas", async (req, res) => {
  const { limits, order_by, page } = req.query;
  console.log("Valor limits, order_by, page antes de llamado: ", limits, order_by, page);
  const inventario = await obtenerJoyas({ limits, order_by, page });
  const HATEOAS = await joyasHATEOAS(inventario, limits, page);
  res.json(HATEOAS); // respuesta del servidor
});


app.get("/inventario", reportarConsulta, async (req, res) => {
  const { limits, order_by, page } = req.query;
  console.log("Valor limits, order_by, page antes de llamado: ", limits, order_by, page);

  try {
    const joyas = await obtenerJoyas({ limits, order_by, page });
    console.log("Página joyas son: ", joyas);
    res.json(joyas); // respuesta del servidor
  } catch (error) {
    console.error("Error al obtener joyas:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


app.get("/inventario/filtros", async (req, res) => {
  const queryStrings = req.query;
  console.log("Valor del queryStrings antes del llamado: ", queryStrings);

  try {
    const joyasFiltradas = await obtenerJoyasPorFiltros(queryStrings);
    res.json(joyasFiltradas); // Respuesta del servidor
  } catch (error) {
    console.error("Error al obtener joyas con filtros:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

 // ruta generica no existente
 app.get("*", (req, res) => {
  res.status(404).send("**** esta ruta no existe ****")
 })