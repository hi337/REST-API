const express = require('express');
const router = express.Router();
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

const ProductsController = require('../controllers/products')

router.get('/', ProductsController.products_get_all)

router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product)

router.get('/:productId', ProductsController.products_get_product_by_id)

router.get('/q/:name', ProductsController.products_query_products_by_name)

router.patch('/:productId', checkAuth, ProductsController.products_update_product)

router.delete('/:productId', checkAuth, ProductsController.products_delete)

module.exports = router;