import express from "express";
import clients from "clients.json"
import workers from "workers.json"
import ClientRoutes from "../Routes/ClientRoutes"

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/", (req,res) => {
   res.status(200).json({message : "api working"});
});

app.use("/clientuser", ClientRoutes);

app.post("/workeruser", (req,res) => {
    
});

app.listen(PORT,()=>{
    console.log(`server is listening on ${PORT}` );
})