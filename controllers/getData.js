const User = require("../models/User");
const RecentRecipe = require("../models/RecentRecipe");


exports.getRecentRecipe = async(req, res) => {
    try{
        const userId = req.user.id;

        const user = await User.findById(userId);
        if(!user){
            console.log("Token has not provided");
            return res.status(401).json({
                success: false,
                message: "Token validation failed"
            })
        }

        const recentRecipe = await RecentRecipe.find({user: userId});
        if(!recentRecipe){
            return res.status(403).json({
                success: false,
                message: "Something went wrong while fetching the recipes"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Recent recipe fetched successfully",
            recentRecipe
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


exports.getUserDetails = async(req, res) => {
    try{
        const userId = req.user.id;

        const user = await User.findById(userId)
                                                .select("-password")
                                                .populate("favoriteRecipes")
                                                .populate("nutritionLogs")
                                                .populate("personalDetails")
                
        if(!user){
            console.log("User not found");
            return res.status(401).json({
                success: false,
                message: "Token validation failed"
            })
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user
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