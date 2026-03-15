/**
 * 이미지 경로를 완전한 URL로 변환합니다.
 * - Cloudinary URL (http로 시작) → 그대로 반환
 * - 로컬 경로 (/public/...) → REACT_APP_SERVERURL 앞에 붙여 반환
 */
export const getImageUrl = (path: string | undefined | null): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_SERVERURL}${path}`;
};
