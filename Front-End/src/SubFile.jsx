import './SubFile.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubFile({ key, file, isDeleted }) {
    useEffect(() => {
        console.log("SubFile Is Getting re-rendered because isDeleted changes");
    }, [isDeleted]);

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/file/${file._id}`, { state: { file } });
    };

    return (
        <div className="SubFile" onClick={handleClick}>
            <div dangerouslySetInnerHTML={{ __html: file.icon }} className='icon'></div>
            <p className='fileName'>
                {file.name} 
                <span>
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </span>
            </p>
            <div className='SubFileLower'></div>
        </div>
    );
}
