const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
        unique: true,
    },

    password: {
        type: String,
        required: [true, "Password is required"]
    },

    avatar: {
        imageURL: String,
        publicId: String
    },

    personalDetails: {
        type: mongoose.Types.ObjectId,
        ref: "PersonalDetails"
    },

    favoriteRecipes: [{
        type: mongoose.Types.ObjectId,
        ref: "SavedRecipe"
    }],

    nutritionLogs: [{
        type: mongoose.Types.ObjectId,
        ref: "NutritionLog"
    }],

    isVerified: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;