const mongoose = require("mongoose")
const Product = require("../models/product");

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select("-__v")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs
        }
        res.status(200).json(response)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    })
}

exports.products_get_chef_products = (req, res, next) => {
    let id = req.userData.id
    Product.find({"chefId": id.toString()})
    .select("-__v")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs
        }
        res.status(200).json(response)
    })
    .catch(err => {res.status(500).json({error: err}); console.log(err)})
}

exports.products_create_product = (req, res, next) => {
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
        delivery: req.body.delivery,
        description: req.body.description,
        chefId: req.userData.id
    });
    product
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Created Product Successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                delivery: result.delivery,
                description: result.description,
                _id: result._id,
                productImage: result.productImage,
                chefId: result.chefId
            }
        })
        console.log(result.chefId)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    });   
}

exports.products_get_product_by_id = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select("-__v")
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json({
                product: doc
            })
        } else {
            res.status(404).json({error: "No Valid Entry Provided"})
        }
    })
    .catch(e => {
        console.log(e)
        res.status(500).json({error: e})
    })
}

exports.products_query_products_by_name = (req, res, next) => {
    let name = req.params.name;
    Product.fuzzySearch(name.toString(), (err, prods) => {console.log(prods, err)})
    .select("-__v")
    .exec()
    .then(doc => {
        const response = {
            count: doc.length,
            products: doc
        }
        res.status(200).json(response)
    })
    .catch(err => {
        res.status(500).json({error: err})
    })
}

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndUpdate(id, {$set: req.body}, {new: true})
    .select("-__v")
    .then(result => res.status(200).json(result))
    .catch(e => res.status(500).json({error: e}))
}

exports.products_delete = (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndDelete(id)
    .select("-__v")
    .exec()
    .then(r => {
        res.status(200).json({
            message: "Product deleted",
            deletedProduct: r
        })
    })
    .catch(e => {
        res.status(500).json({
            error: e
        })
    })
}