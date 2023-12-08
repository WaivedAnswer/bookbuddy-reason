const OpenAI = require("openai");

exports.handler = async (event, _context) => {
    const functionName = "create_book_reason";
    const STRING_TYPE = "string";
    const OBJECT_TYPE = "object"
    const functions = [ {
        name: functionName,
        description: "Creates personalized book recommendation",
        parameters: {
            type: OBJECT_TYPE,
            properties: {
                reason: {
                    type: STRING_TYPE,
                    description: "Sales pitch to the user on the most valuable things they will get from the book."
                } 
            }
        }
    }]
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    const body = JSON.parse(event.body)
    const lookingFor = body.lookingFor
    const bookTitle = body.bookTitle
    const bookAuthor = body.bookAuthor

    //TODO error checking
    const chatResponse = await openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [
                {role: "system", "content": "You give great book recommendations. Limit responses to under 40 words."},
                {role: "user", "content": lookingFor},
                {role: "user", "content": `You suggested ${bookTitle} by ${bookAuthor}. Why is this book a great choice for me? What will I enjoy most?`},
            ],
            functions: functions,
            function_call: {name: functionName}
        });
    console.log(chatResponse.usage)
    const bookReasonCall = chatResponse.choices[0].message.function_call
    if(!bookReasonCall || bookReasonCall.name !== functionName) {
        //TODO replace with error
        return ""
    }

    const results = JSON.parse(bookReasonCall.arguments)

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({reason: results.reason})
    }
    return response
};