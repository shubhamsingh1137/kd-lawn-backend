const express = require("express");

const router = express.Router();

const chatbotController = require("../controllers/chatbotController");

console.log("CHATBOT CONTROLLER:", chatbotController);
console.log(
  "CHAT WITH AGENT:",
  typeof chatbotController.chatWithAgent
);

router.post(
  "/message",
  chatbotController.chatWithAgent
);

module.exports = router;