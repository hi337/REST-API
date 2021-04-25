const mongoose = require("mongoose")
const mongoose_fuzzy = require('mongoose-fuzzy')
const { products_update_product } = require("../controllers/products")

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    delivery: { type: Number, required: true },
    productImage: { type: String, required: true },
    chefId: { type: mongoose.Types.ObjectId, required: true }
})

productSchema.plugin(mongoose_fuzzy, {
    fields: ["name"]
})

module.exports = mongoose.model("Product", productSchema)