const express = require('express');
const router = express.Router();
const mongooose = require('mongoose')

const Order = require('../models/order')
const Product = require('../models/product')

router.get('/', (req, res, next) => {
    Order.find()
    .select("-__v") 
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            orders: docs
        }
        res.status(200).json(response)
    })
    .catch(err => res.status(500).json({
        error: err
    }))
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        const order = new Order({
            _id: mongooose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save();
    })
    .then(result => {
        if (res.statusCode === 404) {
            return res
        }
        res.status(201).json({
            message: "Order Stored",
            order: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId).select("-__v")
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Order Found",
            order: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            }
        })
    })
    .catch(err => {
        res.status(404).json({
            error: err
        })
    })
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId 
    Order.findByIdAndDelete(id)
    .select("-__v")
    .exec()
    .then(r => {
        res.status(200).json({
            message: "Order Deleted",
            deletedOrder: r
        })
    })
    .catch(err => {
        res.status(500).json({error: err})
    })
});

module.exports = router;