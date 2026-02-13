const mongoose = require("mongoose");

const recordsSchema = new mongoose.Schema({
    customerNumber: String,
    qty:Number,
    fat: Number,
    snf: Number,
    rate: Number,
    price: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Records-Gohlani", recordsSchema);
