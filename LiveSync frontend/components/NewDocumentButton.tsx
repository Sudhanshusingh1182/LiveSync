'use client'

import React, { useTransition } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation';
import { createNewDocument } from '@/actions/actions';


function NewDocumentButton() {
  const router = useRouter();

  const [isPending,startTransition ] = useTransition();
  const handleCreateNewDocument = ()=>{
        startTransition(async()=>{
           const {docId} = await createNewDocument();
           router.push(`/doc/${docId}`);
        })
  }  
    
  return (
     <Button onClick={handleCreateNewDocument} disabled={isPending} >
        {
            isPending ? "Creating ..." : "New Document"
        }
     </Button>
  )
}

export default NewDocumentButton