"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/SessionProvider";

interface AvatarPickerProps {
    imageUrl: string | null;
    name: string | null;
    email: string;
}

export default function AvatarPicker({ imageUrl, name, email }: AvatarPickerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const router = useRouter();
    const { refresh } = useSession();

    const initial = (name?.trim() || email)[0]?.toUpperCase() ?? "?";

    const save = async (url: string | null) => {
        try {
            await axios.patch("/api/profile", { imageUrl: url });
            toast.success(url ? "Photo updated" : "Photo removed");
            setIsEditing(false);
            await refresh();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onRemove = async () => {
        setIsRemoving(true);
        await save(null);
        setIsRemoving(false);
    };

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-beige bg-paper">
                {imageUrl ? (
                    <Image
                        alt="Profile photo"
                        src={imageUrl}
                        fill
                        sizes="112px"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-clay-tint font-serif text-3xl font-semibold text-clay">
                        {initial || <User className="h-10 w-10" />}
                    </div>
                )}
            </div>

            <div className="w-full min-w-0 flex-1 space-y-3">
                <div>
                    <h2 className="font-serif text-xl font-semibold">
                        {name?.trim() || "Your profile"}
                    </h2>
                    <p className="truncate text-sm text-grey">{email}</p>
                </div>

                {!isEditing ? (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            {imageUrl ? "Change photo" : "Upload photo"}
                        </Button>
                        {imageUrl && (
                            <Button
                                type="button"
                                size="sm"
                                variant="link"
                                disabled={isRemoving}
                                onClick={onRemove}
                                className="text-grey no-underline hover:text-destructive"
                            >
                                {isRemoving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Remove
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <FileUpload
                            endpoint="userAvatar"
                            onChange={(url) => {
                                if (url) save(url);
                            }}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="link"
                            className="text-grey no-underline"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
