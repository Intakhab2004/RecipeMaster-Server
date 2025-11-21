const express = require("express");
const dbConnect = require("./config/dbConnect");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute");
const recipeRoutes = require("./routes/recipeRoute");
const nutritionRoutes = require("./routes/nutritionRoute");
const dataRoutes = require("./routes/dataRoute");
const profileRoute = require("./routes/profileRoute");
const cors = require("cors");
const fileupload = require("express-fileupload");

const app = express();

require("dotenv").config();


const allowedOrigins = [
    "https://recipe-master-frontend.vercel.app",
    "http://localhost:3000"
]

app.use(cors({
    origin: function (origin, callback) {
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true);
        } 
        else{
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// Required middlewares
app.use(express.json());
app.use(cookieParser());

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

// Mounting api-url on routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/recipe", recipeRoutes);
app.use("/api/v1/nutrition", nutritionRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/profile", profileRoute);


// Starting the server
const PORT = process.env.PORT || 5000;
const startServer = async() => {
    try{
        await dbConnect();
        app.listen(PORT, () => {
            console.log(`App is up and running at port no. ${PORT}`);
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
    }
}

startServer();

// Default Route
app.get("/", (req, res) => {
    console.log("Your server is up and running");
    return res.status(200).json({
        success: true,
        message: "Your server is running"
    })
})

