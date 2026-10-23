const { createPool } = require("mysql2");

const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "todo_db",
});
// pool.query("select*from tasks",(err,res)=>{
//     if(err){
//         console.error("Database connection failed:", err);
//     return;
//     }
//     else{
//         console.log(res);
//     }

// })
module.exports = pool;
