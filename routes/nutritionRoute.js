const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");


const {
    logNutritionByRecipeId,
    logNutritionManually
} = require("../controllers/nutritions")


router.post("/recipe-nutrition", auth, logNutritionByRecipeId);
router.post("/manual-nutrition", auth, logNutritionManually);

module.exports = router;