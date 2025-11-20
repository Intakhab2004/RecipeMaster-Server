const User = require("../models/User");
const RecentRecipe = require("../models/RecentRecipe");
const SavedRecipe = require("../models/SavedRecipe");
const NutritionLog = require("../models/NutritionLogs");
const { customMealSchema } = require("../schemas/customMealSchema");


exports.logNutritionByRecipeId = async(req, res) => {
    try{
        const { recipeId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if(!user){
            console.log("User not found");
            return res.status(401).json({
                success: false,
                message: "Token validation failed"
            })
        }

        const [saved, recent] = await Promise.all([
            RecentRecipe.findOne({spoonacularId: recipeId, user: userId}),
            SavedRecipe.findOne({spoonacularId: recipeId, user: userId})
        ]);

        const source = saved || recent;

        if(!source){
            console.log("Recipe not found in any list");
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            })
        }

        const newNutrition = new NutritionLog({
            user: userId,
            recipe: source._id,
            customMeals: source.title,
            nutrition: {
                calories: source.nutritions?.calories || "",
                protein: parseInt(source.nutritions?.protein) || "",
                carbs: parseInt(source.nutritions?.carbs) || "",
                fat: parseInt(source.nutritions?.fat) || ""
            }
        })
        await newNutrition.save();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$push: {nutritionLogs: newNutrition._id}},
            {new: true}
        );

        if(!updatedUser){
            return res.status(402).json({
                success: false,
                message: "An error occured while saving the data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Nutritions logged successfully"
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



exports.logNutritionManually = async(req, res) => {
    try{
        const { recipeName, calories, protein, carbs, fat } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if(!user){
            console.log("User not found");
            return res.status(401).json({
                success: false,
                message: "Token validation failed"
            })
        }

        // Zod validation
        const customMealQuerySchema = {
            recipeName,
            calories,
            protein,
            carbs,
            fat
        }

        const validationResult = customMealSchema.safeParse(customMealQuerySchema);
        if(!validationResult.success){
            console.log("Validation failed: ", validationResult.error.issues);
            return res.status(403).json({
                success: false,
                message: "Please fill all the inputs carefully",
                errors: validationResult.error.issues
            })
        }

        const data = validationResult.data;

        const newNutrition = new NutritionLog({
            user: userId,
            customMeals: data.recipeName,
            nutrition: {
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat
            }
        })
        await newNutrition.save();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$push: {nutritionLogs: newNutrition._id}},
            {new: true}
        );

        if(!updatedUser){
            return res.status(402).json({
                success: false,
                message: "An error occured while saving the data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Nutritions logged successfully"
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