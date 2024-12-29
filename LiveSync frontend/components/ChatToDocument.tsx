'use client'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { FormEvent, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Input } from "./ui/input";
import * as Y from "yjs";  
import { BotIcon, MessageCircleCode } from "lucide-react";
import Markdown from "react-markdown";

function ChatToDocument({doc}:{doc:Y.Doc}) {
    const [isOpen, setIsOpen] = useState(false);
    const [input,setInput] = useState("");
    const [isPending, startTransition]= useTransition();
    const [summary, setSummary] = useState("");
    const [question, setQuestion] = useState("");

    const handleAskQuestion = async(e: FormEvent) =>{
       
       e.preventDefault();
       
       setQuestion(input);
       
       startTransition(async ()=> {
          const documentData = doc.get("document-store").toJSON();
           //console.log("Request sent with: ",{documentData,question:input});

          try {
            
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentData,
                    question: input,
                }),
            }
          );

         // console.log("Received response: ",res);
          

          if(!res.ok){
            throw new Error(`Error: ${res.status} - ${res.statusText} `);
          } 
           

           
             const {message} = await res.json();
             const text = message.candidates[0].content.parts[0].text;
           //  console.log("Parsed response JSON: ",text);
             
             setInput("");
             setSummary(text)

             toast.success("Question asked successfully!");
          
        } catch (error) {
            console.error("Error asking question: ",error);
            toast.error("Failed to ask question. Please try again.");
            
        }
       })
      
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
   <Button asChild variant="outline" className="w-full md:w-fit " >
  <DialogTrigger>
    <MessageCircleCode className="mr-2" />
     Chat to Document
  </DialogTrigger>
  </Button>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Chat to the Document!</DialogTitle>
      <DialogDescription>
         Ask a question and chat to the document with AI.
      </DialogDescription>

      <hr className="mt-5" />

      {
        question && <p className="mt-5 text-gray-500" >Q: {question} </p>
      }
    </DialogHeader>

    {
        summary && (
            <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100 ">
                <div className="flex">
                  <BotIcon className="w-10 flex-shrink-0" />
                  <p className="font-bold" >
                    GPT {isPending ? "is thinking" : "Says:" }
                  </p>
                </div>
               <div> {isPending ? "Thinking..." : <Markdown>{summary}</Markdown>  }  </div>
            </div>
        )
      }

    <form className="flex gap-2  " onSubmit={handleAskQuestion} >
       <Input
          type="text"
          placeholder="i.e. what is this about?"
          className="w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
       />
       <Button type="submit" disabled={!input || isPending}>
         {isPending ? "Asking..." : "Ask"}
       </Button> 

    </form>
    
  </DialogContent>
</Dialog>

  )
}

export default ChatToDocument;