const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.methods.getId = function () {
  return this._id.toString();
};

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.toPublicJSON = function () {
  return {
    name: this.name,
    email: this.email,
  };
};

module.exports = mongoose.model("User", UserSchema);
