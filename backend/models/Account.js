const mongoose = require("mongoose");

const { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } = require("../utils/currencyHelper");

const AccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        balance: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            enum: SUPPORTED_CURRENCIES,
            default: DEFAULT_CURRENCY,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

AccountSchema.index({ userId: 1, name: 1 }, { unique: true });

AccountSchema.methods.toPublicJSON = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        balance: this.balance,
        currency: this.currency,
    };
};

module.exports = mongoose.model("Account", AccountSchema);