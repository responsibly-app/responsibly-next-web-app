'use client'

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    ReactNode,
} from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from './cropImage'

import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type Props = {
    children: ReactNode
    onComplete: (image: string) => void
}

export function ImageCropperDialog({ children, onComplete }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [image, setImage] = useState<string | null>(null)
    const [objectUrl, setObjectUrl] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    // cleanup
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [objectUrl])

    const loadFile = (file: File) => {
        if (!file.type.startsWith('image/')) return

        if (objectUrl) URL.revokeObjectURL(objectUrl)

        const url = URL.createObjectURL(file)
        setObjectUrl(url)
        setImage(url)
        setOpen(true)

        // reset
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        loadFile(e.target.files[0])
    }

    const onCropComplete = useCallback((_: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels)
    }, [])

    const handleCrop = async () => {
        if (!image || !croppedAreaPixels) return

        const cropped = await getCroppedImg(
            image,
            croppedAreaPixels,
            rotation
        )

        onComplete(cropped)
        setOpen(false)
        setImage(null)
    }

    return (
        <>
            {/* Hidden input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
            />

            {/* Trigger */}
            <div onClick={() => fileInputRef.current?.click()}>
                {children}
            </div>

            {/* Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>

                    {image && (
                        <div className="space-y-6">
                            {/* Cropper */}
                            <div className="relative w-full h-[300px] bg-black rounded-xl overflow-hidden">
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={1} // 👈 avatar use-case
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                />
                            </div>

                            {/* Controls */}
                            <div className="space-y-4">
                                {/* Zoom */}
                                <div>
                                    <p className="text-sm mb-2">Zoom</p>
                                    <Slider
                                        value={[zoom]}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        onValueChange={(val) => setZoom(val[0])}
                                    />
                                </div>

                                {/* Rotation */}
                                <div>
                                    <p className="text-sm mb-2">Rotation</p>

                                    <div className="relative">
                                        <Slider
                                            value={[rotation]}
                                            min={-180}
                                            max={180}
                                            step={1}
                                            onValueChange={(val) => {
                                                const v = val[0]
                                                setRotation(Math.abs(v) < 2 ? 0 : v)
                                            }}
                                        />

                                        {/* center marker */}
                                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-4 bg-white/70" />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button onClick={handleCrop} className="w-full">
                                        Save
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}