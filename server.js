import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fileUpload from "express-fileupload";

dotenv.config();

//routes
import userRouter from "./src/router/userRouter.js"
import categoryRouter from "./src/router/categoryRouter.js"
import bookRouter from "./src/router/bookRouter.js"
import commentRouter from "./src/router/commentRouter.js"

const app = express();
const PORT = process.env.PORT || 4000;

// static folder

app.use(express.static(path.join("src",  "files")));

//middlewares
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

//user routes

app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", bookRouter);
app.use("/", commentRouter);

//connectDB and run server
const start = async () => {
    try {
        await mongoose.connect("mongodb+srv://shukurullayevxojiakbar9_db_user:barca@bookapp.uafdhi3.mongodb.net/");
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
    } catch (error) {
        console.log(error);
    }
}

start();