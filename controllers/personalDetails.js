const { personalDetailsSchema } = require("../schemas/personalDetailsSchema");
const User = require("../models/User");
const PersonalDetails = require("../models/PersonalDetails");
const SavedRecipe = require("../models/SavedRecipe");
const cloudinary = require("../config/cloudinaryConfig");



exports.updateDetails = async(req, res) => {
    try{
        const {firstName, lastName, gender, DOB, contactNumber} = req.body;
        const userId = req.user.id;

        const detailsSchema = {
            firstName,
            lastName,
            gender,
            DOB: DOB ? new Date(DOB) : null,
            contactNumber
        }

        // Zod validation
        const validationResult = personalDetailsSchema.safeParse(detailsSchema);
        if(!validationResult.success){
            console.log("Zod validation failed: ", validationResult.error.issues);
            return res.status(401).json({
                success: false,
                message: "Please fill the input correctly",
                errors: validationResult.error.issues
            })
        }

        const parsedData = validationResult.data;

        const user = await User.findById(userId);
        if(!user){
            console.log("User not exists with the given id");
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const profile = await PersonalDetails.findById(user.personalDetails);
        if(!profile){
            console.log("User's profile not found");
            return res.status(404).json({
                success: false,
                message: "profile not found"
            })
        }

        if(parsedData.firstName) profile.firstName = firstName; 
        if(parsedData.lastName) profile.lastName = lastName; 
        if(parsedData.gender) profile.gender = gender; 
        if(parsedData.DOB) profile.DOB = DOB; 
        if(parsedData.contactNumber) profile.contactNumber = contactNumber;

        await profile.save();

        return res.status(200).json({
            success: true,
            message: "Personal details updated successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.updateProfileImage = async(req, res) => {
    try{
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if(!user){
            console.log("User not found");
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if(!req.files || !req.files.image){
            console.log("File not found");
            return res.status(404).json({
                success: false,
                message: "Image file not found"
            })
        }

        const file = req.files.image;

        if(user?.avatar?.publicId){
            await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "profileImage"
        })

        user.avatar.imageURL = result.secure_url;
        user.avatar.publicId = result.public_id;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile photo uploaded successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.deleteUser = async(req, res) => {
    try{
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if(user?.avatar?.publicId){
            await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        await SavedRecipe.deleteMany({user: user._id});
        await PersonalDetails.findByIdAndDelete(user.personalDetails);

        await User.findByIdAndDelete(user._id);

        res.clearCookie("token", {
            httpOnly: true
        })

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}