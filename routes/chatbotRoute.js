const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");


const { chatBot } = require("../controllers/chatbot");

router.post("/chatbot-reply", auth, chatBot);

module.exports = router;