import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Topbar from '../components/Topbar';
import BeforeAfter from '../components/errorlogpage/BeforeAfter';
import ErrorLogHeader from '../components/errorlogpage/ErrorLogHeader';
import '../styles/ErrorLogPage.scss';
import axios from 'axios';

function ErrorLogPage() {
    const [langRevisedLists, setLangRevisedLists] = useState<string[]>([]);
    const [culRevisedLists, setCulRevisedLists] = useState<string[]>([]);
    const [chatRevisedLists, setChatRevisedLists] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getRevisedLists = async () => {
        setIsLoading(true);
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/getRevisedLists`,
                withCredentials: true,
            });
            setLangRevisedLists(res.data.langRes);
            setCulRevisedLists(res.data.culRes);
            setChatRevisedLists(res.data.chatRes);
        } catch (error) {
            alert(`Error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getRevisedLists();
    }, []);

    const totalCount =
        culRevisedLists.length +
        langRevisedLists.length +
        chatRevisedLists.length;

    return (
        <>
            <ErrorLogHeader />
            <div className="errorlogpage-container">
                <div className="errorlogpage">
                    <div className="beforeafters-container">
                        {isLoading ? (
                            <div className="errorlog-skeleton">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="errorlog-skeleton-item">
                                        <div className="skeleton-line errorlog-skeleton-before" />
                                        <div className="skeleton-line errorlog-skeleton-arrow" />
                                        <div className="skeleton-line errorlog-skeleton-after" />
                                    </div>
                                ))}
                            </div>
                        ) : totalCount === 0 ? (
                            <div className="errorlog-empty">
                                <div className="errorlog-empty-icon">📝</div>
                                <div>아직 교정 기록이 없습니다</div>
                            </div>
                        ) : (
                            <>
                                {culRevisedLists.map((elem: any, index) => (
                                    <BeforeAfter key={index} comment={elem} />
                                ))}
                                {langRevisedLists.map((elem: any, index) => (
                                    <BeforeAfter key={index} comment={elem} />
                                ))}
                                {chatRevisedLists.map((elem: any, index) => (
                                    <BeforeAfter key={index} comment={elem} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default ErrorLogPage;
