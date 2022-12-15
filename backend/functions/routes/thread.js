const express = require("express");
const { requestContainsAllRequiredData } = require("../controllers/requestController");
const Thread = require("../models/Thread");

// Below recommended for cloud functions to format console logs
require("firebase-functions/logger/compat");

const router = express.Router();

router.get("/response", async (request, response) => {
    const requiredParams = ["thread", "sentiment"]
    if (!requestContainsAllRequiredData(request, "body", requiredParams)) {
        response.status(400).json({
            success: false,
            reason: "Missing parameter(s)"
        });
        return;
    }
    
    try {
        const thread = request.body.thread;
        const sentiment = request.body.sentiment;

        const suggestion = await Thread.getResponse(thread, sentiment);

        response.set("Cache-Control", "private, max-age=300, s-maxage=600");
        response.status(200).json({
            success: true,
            response: suggestion,
        });
    } catch(error) {
        console.error(error);
        response.status(500).json({success: false});
    }
    
});

module.exports = router;
