import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 60,
    trim: true,
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: "Invalid email address",
    },
  },
  role: {
    type: String,
    enum: ["admin", "writer", "guest"],
  },
  age: {
    type: Number,
    min: 1,
    max: 99,
  },
  numberOfArticles: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", function (next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.pre("update", function (next) {
  this.update(
    {},
    {
      $set: {
        fullName: `${this.getUpdate().$set.firstName} ${
          this.getUpdate().$set.lastName
        }`,
      },
    }
  );
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
