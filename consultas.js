import pkg from "pg";
import format from "pg-format";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "32387925",
  database: "joyas", 
  port: 5432,
  allowExitOnIdle: true,
});

//? Codigo que estructura HATEOAS de todas las joyas almacenadas en la base // de datos 
const joyasHATEOAS = async (inventario, limits, page) => {
  // ya con pagina y limites
  const resultados = inventario.map((j) => {
    return {
      nombre: j.nombre,
      precio: j.precio,
      url: `http://localhost:3000/inventario/${j.id}`,
    };
  });

  console.log("Valor de resultados: ", resultados);

  // Toda la tabla
  const textoConsulta = "SELECT * FROM inventario";
  const { rows: datos } = await pool.query(textoConsulta);

  // obtener total de elementos
  const total = datos.length;
  const total_paginas = Math.ceil(total / limits);
  console.log(
    "Total registros límites Total Páginas: ",
    total,
    limits,
    total_paginas
  );

  // HATEOAS COMO RESPUESTA
  const HATEOAS = {
    total,
    resultados,
    meta: {
      total: total,
      limit: parseInt(limits),
      page: parseInt(page),
      total_paginas: total_paginas,
      siguiente:
        total_paginas <= page
          ? null
          : `http://localhost:3000/inventario?limits=${limits}&page=${
              parseInt(page) + 1 // Página siguiente
            }`,
      anterior:
        page <= 1
          ? null
          : `http://localhost:3000/inventario?limits=${limits}&page=${
              parseInt(page) - 1 // Página anterior
            }`,
    },
  };

  console.log("Valor de HATEOAS: ", HATEOAS);

  return HATEOAS;
};

//? Codigo que permkte recibir los parámetros en la query los siguientes elementos:
// i. limits: Limita la cantidad de joyas a devolver por página
// ii. page: Define la página
// iii. order_by: Ordena las joyas según el valor de este parámetro, ejemplo:
// stock_ASC

const obtenerJoyas = async ({
  limits = 10,
  order_by = "id_ASC",
  page = 1,
}) => {
  // pagina por defecto
  const [campo, direccion] = order_by.split("_");
  // const offset = page * limits; // Inicia en pagina 0
  const offset = (page - 1) * limits; // Inicia en pagina 1 Validar si alguien pone 0

  console.log("campo y forma de ordenamiento: ", campo + " " + direccion);
  console.log("page y offset: ", page + " " + offset);

  const formattedQuery = format(
    "SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s", //Cada porcentaje se reemplaza por el orden siguiente:
    campo, // order by
    direccion, // ASC or DESC
    limits, // LIMIT
    offset // OFFSET
  );

  const { rows: inventario } = await pool.query(formattedQuery);
  return inventario;
};

// Código que permite recibir los parámetros para filtrar joyas por diferentes criterios
const obtenerJoyasPorFiltros = async ({ precio_max, precio_min, categoria, metal }) => {
  let filtros = []; //=>[] precio mayor, menor o igual
  if (precio_max) filtros.push(`precio <= ${precio_max}`);
  if (precio_min) filtros.push(`precio >= ${precio_min}`);
  if (categoria) filtros.push(`categoria = '${categoria}'`);
  if (metal) filtros.push(`metal = '${metal}'`);

  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }

  // consultas parametrizadas
  const { rows: inventario } = await pool.query(consulta);
  return inventario;
};

export { joyasHATEOAS, obtenerJoyas, obtenerJoyasPorFiltros };


