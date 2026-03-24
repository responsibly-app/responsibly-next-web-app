"use client"

import ImageCropper from '@/components/image-cropper/ImageCropper'
import { ImageCropperDialog } from '@/components/image-cropper/ImageCropperV2'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CameraIcon } from 'lucide-react'


export default function Page() {
    return (
        // <div className="p-6">
        //     <ImageCropper />
        // </div>

        <ImageCropperDialog onComplete={(img) => console.log(img)}>
            <div className="relative shrink-0">
                {/* <Avatar className="size-20">
                    <AvatarImage src={displayAvatar} alt={user?.name} />
                    <AvatarFallback className="text-lg font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar> */}

                <button
                    type="button"
                    className="bg-blue-600 hover:bg-muted border-border flex size-7 items-center justify-center rounded-full border"
                >
                    <CameraIcon className="size-3" />
                </button>
            </div>
        </ImageCropperDialog>
    )
}