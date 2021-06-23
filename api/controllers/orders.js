const mongoose = require('mongoose')
const Order = require('../models/order')
const Product = require('../models/product')
const admin = require("firebase-admin")

exports.orders_get_all = (req, res, next) => {
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
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        const cost = product.price
        const delivery = product.delivery
        const quantity = req.body.quantity
        const totalPrice = (cost * quantity) + delivery
        
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: quantity,
            product: req.body.productId,
            totalCost: totalPrice,
            idOfUser: req.userData.id,
            idOfChef: product.chefId
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
                quantity: result.quantity,
                idOfUser: result.idOfUser,
                idOfChef: result.idOfChef
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId).select("-__v")
    .populate("product")
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
}

exports.orders_delete_order = (req, res, next) => {
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
}

exports.orders_get_chef_orders = (req, res, next) => {
    let id = req.userData.id
    Order.find({"idOfChef": id.toString()})
    .select("-__v")
    .populate("product")
    .exec()
    .then(docs => {
        if (res.statusCode === 404) {
            return res
        }
        const response = {
            count: docs.length,
            orders: docs
        }
        res.status(200).json(response)
    })
    .catch(err => {res.status(500).json({error: err}); console.log(err)})
}

exports.orders_get_user_orders = (req, res, next) => {
    let id = req.userData.id
    Order.find({"idOfUser": id.toString()})
    .select("-__v")
    .populate("product")
    .exec()
    .then(docs => {
        if (res.statusCode === 404) {
            return res
        }
        const response = {
            count: docs.length,
            orders: docs
        }
        res.status(200).json(response)
    })
    .catch(err => {res.status(500).json({error: err}); console.log(err)})
}