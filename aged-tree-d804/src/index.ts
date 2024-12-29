import { GoogleGenerativeAI } from '@google/generative-ai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
	GEMINI_API_KEY: string;
	AI: Ai;
	ACCOUNT_ID : string;
	GATEWAY_NAME : string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	'/*',
	cors({
		origin: '*',
		allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
		allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
		exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		maxAge: 600,
		credentials: true,
	})
);

app.post('/chatToDocument', async (c) => {

	const { documentData, question } = await c.req.json();
    
	//Initialise GeminiAI
	const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
	const model = genAI.getGenerativeModel(
		{model: 'gemini-1.5-flash'},
		{
			baseUrl: `https://gateway.ai.cloudflare.com/v1/${c.env.ACCOUNT_ID}/${c.env.GATEWAY_NAME}/google-ai-studio`
		}
	);

	const chatCompletion = await model.generateContent([
		`You are an assistant helping the user to chat to a document. The document is about: ${documentData}. Using this, answer the following question in the clearest way possible: ${question}`,
	]);

	//console.log("Generated response is: ",chatCompletion.response.text());

	return c.json({ message: chatCompletion.response}, { headers: { "Access-Control-Allow-Origin": "*" } });
});

app.post('/translateDocument', async (c) => {
	const { documentData, target_lang } = await c.req.json();
    
	//console.log("Received payload in backend :", {documentData,target_lang });

	if(!target_lang){
	  	console.log("Error: target_lang is missing");
		return c.json({error:"target_lang is required"},400);
		
	}

	try {
		
	//Generate a summary of the document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});
    
	//console.log("Summary Response: ",summaryResponse);
	
	//Translate the summary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		source_lang: 'english',
		target_lang,
	});

	//console.log("Translation Response: ",response);
	return new Response(JSON.stringify(response));
		
	} catch (error) {
		console.log("Error during translation", error);
		return new Response(JSON.stringify({error:"Error during translation"}), {status: 500});
		
	}
	
});

export default app;
