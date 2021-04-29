const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');


const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders")
const userRoutes = require("./api/routes/user")

mongoose.connect('mongodb+srv://hi337:' + process.env.MONGO_ATLAS_PW + '@make-e-me.j3egt.mongodb.net/Make-e-Me?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
)


app.use("/uploads/", express.static("uploads"))

// morgan and body parsing
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json());

// CORS handling
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, PATCH, GET");
        return res.status(200).json({});
    }
    next();
})

app.use("/products", productRoutes);
app.use('/orders', orderRoutes);
app.use("/user", userRoutes)


// error handlers
app.use((res, req, next) => {
    const error = new Error("Not Found");
    error.status = 404
    next(error);
})
app.use((error, req, res, next) => {
    console.log(error)
    res.status(error.status || 500);
    res.json({
        error: error
    })
});

module.exports = app;