import '../../styles/AlertPageHeader.scss';
import { useNavigate } from 'react-router-dom';

function AlertPageHeader() {

    const navigate = useNavigate();

    return ( 
        <>
            <div className='alert-header-container'>
                <div className='back-arrow' onClick={()=>navigate('/posts')}></div>
                <div className ='alert-header-text'>알림</div>
            </div>
        </>
     );
}

export default AlertPageHeader;