export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = url
        img.onload = () => resolve(img)
        img.onerror = reject
    })

const getRadianAngle = (degree: number) => (degree * Math.PI) / 180

const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
        width:
            Math.abs(Math.cos(rotRad) * width) +
            Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) +
            Math.abs(Math.cos(rotRad) * height),
    }
}

export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any,
    rotation = 0
): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const rotRad = getRadianAngle(rotation)

    const { width: bW, height: bH } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    canvas.width = bW
    canvas.height = bH

    ctx.translate(bW / 2, bH / 2)
    ctx.rotate(rotRad)
    ctx.translate(-image.width / 2, -image.height / 2)

    ctx.drawImage(image, 0, 0)

    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')!

    croppedCanvas.width = pixelCrop.width
    croppedCanvas.height = pixelCrop.height

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        croppedCanvas.toBlob((file) => {
            resolve(URL.createObjectURL(file!))
        }, 'image/jpeg')
    })
}