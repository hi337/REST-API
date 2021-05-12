const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: { type: mongoose.Types.ObjectId, ref: "Product", required: true},
    quantity: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    idOfUser: { type: mongoose.Types.ObjectId, required: true },
    idOfChef: { type: mongoose.Types.ObjectId, required: true }
})

module.exports = mongoose.model("Order", orderSchema)