import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useState } from 'react';
import axios from 'axios';
import '../styles/NewPostButton.scss';
import '../styles/NewPostHeader.scss';
import '../styles/NewPostPage.scss';
import '../styles/NewPostPhotos.scss';
import '../styles/NewPostWritePost.scss';
import useErrorHandler from '../utils/useErrorHandler';
function NewPostPage() {
    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const { errorHandler } = useErrorHandler();
    const navigate = useNavigate();

    const textareaRef = useRef<any>(null);

    //multer 관련 코드
    const images = useRef<any>(null);

    const handleCameraClick = () => {
        images.current.click();
    };

    const [selectedCategory, setSelectedCategory] = React.useState('lang');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    const handleResizeHeight = () => {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height =
            textareaRef.current.scrollHeight + 'px';
    };

    const handleImageChange = () => {
        const selectedImages = images.current.files;
        const imageUrls: string[] = [];

        for (let i = 0; i < selectedImages.length; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result) {
                    imageUrls.push(e.target.result as string);
                    setUploadedImages([...imageUrls]);
                }
            };
            reader.readAsDataURL(selectedImages[i]);
        }
    };

    let selectRef = useRef<any>(null);

    async function submitPost() {
        const option = selectRef.current?.value;
        if (option === 'lang') {
            try {
                const res = await axios({
                    method: 'post',
                    url: `${process.env.REACT_APP_SERVERURL}/${option}/posts/createpost`,
                    data: {
                        userid: idCookie,
                        content: textareaRef.current?.value,
                    },
                    withCredentials: true,
                });
                if (res.data.isError === false) {
                    navigate('/posts');
                }
            } catch (error: any) {
                errorHandler(error.response?.status);
                console.log(error);
            }
        } else {
            try {
                const formData = new FormData();
                for (let i = 0; i < images.current.files.length; i++) {
                    formData.append('files', images.current.files[i]);
                }
                formData.append('userid', idCookie);
                formData.append('content', textareaRef.current?.value);
                const res = await axios({
                    method: 'post',
                    url: `${process.env.REACT_APP_SERVERURL}/${option}/posts/createpost`,
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                });
                if (res.data.isError === false) {
                    navigate('/posts');
                }
            } catch (error: any) {
                errorHandler(error.response?.status);
                console.log(error);
            }
        }
    }

    return (
        <>
            <div className="newpost-header-container">
                <div className="back-arrow" onClick={() => navigate(-1)}></div>
                <div className="newpost-header-text">새 포스트</div>
            </div>
            <div className="newpostpage-container">
                <div className="newpostpage">
                    <img src="/public\\posts\\aaaa1706235325370.jpg" alt="" />

                    <div className="writepost-container">
                        <div className="writepost-inner-container">
                            <div className="writepost-title">포스트 내용</div>
                            <select
                                className="categoryBox"
                                name="category"
                                required
                                ref={selectRef}
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                            >
                                <option value="lang">언어</option>
                                <option value="cul">문화</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="포스트 내용을 작성해 주세요..."
                            ref={textareaRef}
                            rows={1}
                            onChange={() => {
                                handleResizeHeight();
                            }}
                        ></textarea>
                    </div>

                    {selectedCategory === 'cul' ? (
                        <div className="newpost-photos-container">
                            <input
                                type="file"
                                multiple
                                ref={images}
                                accept=".jpg, .png, .jpeg"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />

                            <div
                                className="camera"
                                onClick={handleCameraClick}
                            ></div>
                            {uploadedImages.map((imageUrl, index) => (
                                <img
                                    className="image"
                                    key={index}
                                    src={imageUrl}
                                    alt={`Uploaded ${index + 1}`}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
                <div className="newpost-button-container">
                    <button onClick={() => submitPost()}>포스팅</button>
                </div>
            </div>
        </>
    );
}
export default NewPostPage;
