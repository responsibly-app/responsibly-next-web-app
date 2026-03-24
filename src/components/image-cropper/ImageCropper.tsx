'use client'

import { useState, useCallback, useEffect } from 'react'
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

export default function ImageCropper() {
    const [image, setImage] = useState<string | null>(null)
    const [objectUrl, setObjectUrl] = useState<string | null>(null)

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [croppedImage, setCroppedImage] = useState<string | null>(null)

    // ✅ Clean up object URL (important!)
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

        // reset controls
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
    }

    // 📁 File picker
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        loadFile(e.target.files[0])
    }

    // 📦 Drag & drop
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files?.length) {
            loadFile(e.dataTransfer.files[0])
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    // 📋 Paste support
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items
            if (!items) return

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile()
                    if (file) loadFile(file)
                }
            }
        }

        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [])

    const onCropComplete = useCallback((_: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels)
    }, [])

    const handleCrop = async () => {
        if (!image || !croppedAreaPixels) return
        const result = await getCroppedImg(
            image,
            croppedAreaPixels,
            rotation
        )
        setCroppedImage(result)
    }

    return (
        <div className="w-full space-y-6">
            {/* Upload Zone */}
            {!image && (
                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted/50 transition"
                >
                    <p className="text-sm text-muted-foreground mb-3">
                        Drag & drop, paste, or upload an image
                    </p>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                        id="upload"
                    />

                    <label htmlFor="upload">
                        <Button asChild>
                            <span>Select Image</span>
                        </Button>
                    </label>
                </div>
            )}

            {/* Cropper */}
            {image && (
                <>
                    <div className="relative w-full h-[300px] md:h-[400px] bg-black rounded-xl overflow-hidden">
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1 / 1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    {/* Controls */}
                    <div className="space-y-5">
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

                        {/* Rotation (centered) */}
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
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-4 bg-white/70 rounded-full" />
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">
                                {rotation}°
                            </p>

                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setRotation(0)}
                            >
                                Reset rotation
                            </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button onClick={handleCrop} className="w-full">
                                Crop Image
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => setImage(null)}
                            >
                                Change
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Result */}
            <Dialog open={!!croppedImage} onOpenChange={() => setCroppedImage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cropped Image</DialogTitle>
                    </DialogHeader>

                    {croppedImage && (
                        <img
                            src={croppedImage}
                            alt="Cropped result"
                            className="w-full rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}