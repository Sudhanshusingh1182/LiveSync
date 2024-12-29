'use client'
import * as Y from "yjs"
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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { startTransition, useState, useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { BotIcon, LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown"

type Language = 
   | "english"
   | "spanish"
   |  "portuguese"
   | "french"
   | "german"
   | "chinese"
   | "arabic"
   | "hindi"
   | "russian"
   | "japanese"

const languages : Language[] = [
    "english",
    "spanish",
    "portuguese",
    "french",
    "german",
    "chinese",
    "arabic",
    "hindi",
    "russian",
    "japanese"
];    

function TranslateDocument({doc}: {doc: Y.Doc}) {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<string>("");
    const [summary, setSummary] = useState("");
    const [question, setQuestion] = useState("");
    const [isPending, startTransition] = useTransition();
    
      

    const handleAskQuestion = async(e: React.FormEvent) => {
           e.preventDefault();

           startTransition(async()=> {
               const documentData = doc.get("document-store").toJSON();
               
               const parser = new DOMParser();
               const xmlDoc = parser.parseFromString(documentData, "text/xml");

               const paragraphs = Array.from(xmlDoc.getElementsByTagName("paragraph"));
               
               const content = paragraphs.map((p)=> p.textContent?.trim()).filter((text)=>text).join(" ");

              // console.log("Extracted content : ",content);
               
               
               const payload ={ 
                documentData:content ,
                target_lang: language,
            
             }

               //console.log("Sending payload", payload); //Debugging
             
 
               const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body:JSON.stringify({
                     documentData : content ,
                     target_lang : language,
                  })
               });

              // console.log("Received response: ",res);
               
               if(res.ok){
                  const {translated_text} = await res.json();

                  setSummary(translated_text);
                  toast.success("Translated Summary successfully!");
               } else{
                const error = await res.json();
                toast.error(error.message || "Translation failed!");
               }

           })

    };

  return (
  <Dialog open={isOpen} onOpenChange={setIsOpen} >
  <Button asChild variant="outline" className="w-full md:w-fit " >
 <DialogTrigger>
    <LanguagesIcon />
     Translate
 </DialogTrigger>
 </Button>
 <DialogContent>
   <DialogHeader>
     <DialogTitle>Translate the Document</DialogTitle>
     <DialogDescription>
        Select a language and AI will translate a summary of the document in the selected language.
     </DialogDescription>
    
    <hr className="mt-5" />

    {question && <p className="mt-5 text-gray-500">Q: {question} </p> }

   </DialogHeader>

   {/* render summary */}
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
      
      <Select 
         value={language}
         onValueChange = {(value)=> setLanguage(value)}
        > 
        <SelectTrigger className='w-full' >
            <SelectValue placeholder="Select a language" />

        </SelectTrigger>
        
        <SelectContent>
            {languages.map((language) => (
                <SelectItem key={language} value= {language}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                </SelectItem>
            ))}
        </SelectContent>

      </Select>

      <Button type="submit" disabled={!language || isPending}>
        {isPending ? "Translating..." : "Translate"}
      </Button> 

   </form>
   
 </DialogContent>
</Dialog>
  );
}


export default TranslateDocument