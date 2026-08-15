'use client'

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input"
import { Button } from "./ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import useOwner from "@/lib/useOwner";
import Editor from "./Editor";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import Avatars from "./Avatars";

function Document({ id }: { id: string }) {
    const [data] = useDocumentDataOnce(doc(db, "documents", id));
    const [input, setInput] = useState("");
    const [isUpdating, startTransition] = useTransition();
    const isOwner = useOwner();

    useEffect(() => {
        if (data) {
            setInput(data.title);
        }
    }, [data]);

    if (!id) {
        return null;
    }

    const updateTitle = (e: FormEvent) => {
        e.preventDefault();

        if (input.trim()) {
            startTransition(async () => {
                await updateDoc(doc(db, "documents", id), { title: input });
            });
        }
    };

    return (
        <div className="flex-1 h-full bg-white p-5 " >
            <div className="flex max-w-6xl mx-auto justify-between pb-5 md:flex-col md:w-full " >
                <form className="flex flex-1 flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2" onSubmit={updateTitle} >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />

                    <Button disabled={isUpdating} type="submit" >
                        {isUpdating ? "Updating..." : "Update"}
                    </Button>

                    {isOwner && (
                        <>
                            <InviteUser />
                            <DeleteDocument />
                        </>
                    )}
                </form>
            </div>

            <div className="flex max-w-6xl mx-auto justify-between items-center mb-5 flex-col md:flex-row ">
                <ManageUsers />
                <Avatars />
            </div>
            <hr className="pb-10" />
            <Editor />
        </div>
    );
}

export default Document;
