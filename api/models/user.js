const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fullName: { type: String, required: true },
    Phone: { type: String, required: true },
    email: { 
        type: String,
        required: true, 
        unique: true,
        match: /^([0-9a-zA-Z]([-\.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
    },
    password: { type: String, required: true }
})

module.exports = mongoose.model("User", userSchema)