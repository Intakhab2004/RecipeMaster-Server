const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");


const {
    updateDetails,
    updateProfileImage,
    deleteUser
} = require("../controllers/personalDetails");

router.put("/update-details", auth, updateDetails);
router.put("/update-profilePic", auth, updateProfileImage);
router.delete("/delete-user", auth, deleteUser);

module.exports = router;