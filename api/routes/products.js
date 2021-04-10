const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
const multer = require("multer")
const checkAuth = require("../middleware/check_auth")

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads/")
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})

const upload = multer({ storage: storage, })

const Product = require("../models/product");

router.get('/', (req, res, next) => {
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
})

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
    .save()
    .then(result => {
        console.log('result')
        res.status(201).json({
            message: 'Created Product Successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                productImage: result.productImage
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    });
    
    
})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select("-__v")
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json(doc)
        } else {
            res.status(404).json({error: "No Valid Entry Provided"})
        }
    })
    .catch(e => {
        console.log(e)
        res.status(500).json({error: e})
    })
})

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndUpdate(id, {$set: req.body}, {new: true})
    .select("-__v")
    .then(result => res.status(200).json(result))
    .catch(e => res.status(500).json({error: e}))
})

router.delete('/:productId', (req, res, next) => {
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
})

module.exports = router;