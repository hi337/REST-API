const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check_auth')

const OrdersController = require('../controllers/orders')

router.get('/', checkAuth, OrdersController.orders_get_all);

router.post('/', checkAuth, OrdersController.orders_create_order);

router.get('/:orderId', checkAuth, OrdersController.orders_get_order);

router.delete('/:orderId', checkAuth, OrdersController.orders_delete_order);

router.get("/id/chefId", checkAuth, OrdersController.orders_get_chef_orders)

router.get("/id/userId", checkAuth, OrdersController.orders_get_user_orders)

module.exports = router;