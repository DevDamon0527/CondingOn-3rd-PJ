import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const getPostMulterConfig = () => ({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'naiclover/posts',
            allowed_formats: ['jpg', 'jpeg', 'png'],
        } as any,
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});

export const getMyPageMulterConfig = () => ({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'naiclover/mypage',
            allowed_formats: ['jpg', 'jpeg', 'png'],
        } as any,
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});
