import { useNavigate } from 'react-router-dom';
import './CSS/HotelDetails.css';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className='dashboardPage'>
            <div className='hdBackdrop'>
                <h1 style={{
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: '5rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    letterSpacing: '-0.02em'
                }}>
                    Page Not Found
                </h1>
                <button className='placeAddBtn' onClick={() => navigate('/')}>Go to Home</button>
            </div>
        </div>
        
    );
};

export default PageNotFound;
