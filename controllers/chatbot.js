const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


exports.chatBot = async(req, res) => {
    try{
        const { message } = req.body;
        if(!message){
            console.log("Message is required");
            return res.status(401).json({
                success: false,
                message: "Some message/text is required"
            })
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: `You are a structured-response assistant.
                                            Always format your answers using headings, bullet points, numbered lists, and line breaks.
                                            Never respond in a single long paragraph.
                                            Use markdown format for clarity.`
                },
                { role: "user", content: message }
            ]
        })

        const reply = completion.choices[0].message.content;

        return res.status(200).json({
            success: true,
            reply
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Chatbot error"
        })
    }
}