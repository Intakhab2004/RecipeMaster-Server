const mongoose = require("mongoose");


const detailsSchema = new mongoose.Schema({
    firstName: {
        type: String
    },

    lastName: {
        type: String
    },

    gender: {
        type: String,
        enum: ["Male", "Female"]
    },

    DOB: {
        type: String
    },

    contactNumber: {
        type: String
    }
})

const personalDetailsModel = mongoose.model("PersonalDetails", detailsSchema);
module.exports = personalDetailsModel;