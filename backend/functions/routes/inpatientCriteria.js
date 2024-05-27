const functions = require('firebase-functions/v2');
const axios = require('axios');

const formatError = require("../../utils/formatError.js")

const openAIKey = process.env.OPENAI_API_KEY;

module.exports.getNumQuestions = functions.https.onRequest({cors:true},(request,response)=>{

})

module.exports.getCriteriaName = functions.https.onRequest({cors:true},(request,response)=>{

})

module.exports.getCorrectCriteria = functions.https.onRequest({cors:true},(request,response)=>{

})

module.exports.analyzeAnswer = functions.https.onRequest({ cors: true }, (request, response) => {

    const data = request.body;
    const textContent = data.textContent; // User's provided criteria
    const diagnosisName = data.diagnosisName; // Name of the diagnosis
    const correctCriteria = data.correctCriteria; // Actual criteria for the diagnosis

    // Construct a detailed prompt for OpenAI
    const prompt = `Evaluate the accuracy of the submitted criteria for the diagnosis '${diagnosisName}'. User's input: '${textContent}'. Expected criteria: '${correctCriteria}'. Provide a numerical rating from 0 to 10 on how accurate the submission is, enclosed in double brackets like [[10]], and include a detailed explanation.`;

    axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4-32k',
            messages: [
                {
                    role: 'system',
                    content: 'You are an assistant that evaluates medical criteria submissions. Provide a numerical rating enclosed in double brackets and detailed feedback.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 300, // Increased token count for detailed feedback
        },
        {
            headers: {
                'Authorization': `Bearer ${openAIKey}`,
                'Content-Type': 'application/json',
            },
        }
    ).then(apiResponse => {
        const aiText = apiResponse.data.choices[0].message.content;
        const ratingMatch = aiText.match(/\[\[\s*(\d+)\s*\]\]/); // Regex to extract score enclosed in [[ ]]
        const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0; // Convert to integer
        response.json({
            explanation: aiText.replace(/\[\[\s*\d+\s*\]\]/, ''), // Removing the score from the explanation for clarity
            score: rating
        });
    }).catch(error => {
        response.status(500).json(formatError(error.response.data))
    });

});