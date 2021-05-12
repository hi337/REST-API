const mongoose = require("mongoose")
const Product = require("../models/product");
const fs = require("fs")
const fetch = require("node-fetch")

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

exports.products_create_product = async (req, res, next) => {

    const namefilter = await fetch("https://www.purgomalum.com/service/containsprofanity?text="+req.body.name)
    const descriptionfilter = await fetch("https://www.purgomalum.com/service/containsprofanity?text="+req.body.description)
    const namevalue = await namefilter.text()
    const descriptionvalue = await descriptionfilter.text()

    if (namevalue === "false" && descriptionvalue === "false") {
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
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: err})
        });
    } else {
        return res.status(500).json({
            message: "Inappropriate values have been passed in the name or description fields! Try Again."
        })
    }

       
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
    let oldpath;

        Product.findById(id)
        .select("-__v")
        .exec()
        .then(doc => {
            if (doc) {
                oldpath = doc.productImage
            } else {
                res.status(404).json({error: "No Valid Entry Provided"})
            }
        })
        .catch(e => {
            console.log(e)
            res.status(500).json({error: e})
        })

    Product.findByIdAndUpdate(id, {
        name: req.body.name,
        price: req.body.price,
        delivery: req.body.delivery,
        description: req.body.description,
        productImage: req.file.path
    }, {new: true})
    .select("-__v")
    .then(result => {
        res.status(200).json({
            message: "Product updated",
            updatedProduct: result
        })

        fs.unlink(oldpath, (err) => {
            if (err) console.log(err)
        })
    })
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
        const productImage = r.productImage
        fs.unlink(productImage, (err) => {
            if (err) console.log(err)
        })
    })
    .catch(e => {
        res.status(500).json({
            error: e
        })
    })
}