import './MyCloud.css';
import SubFile from './SubFile';

export default function MyCloud({ data }) {
    return (
        <div className='MyCloud'>
            <h1 className='heading'>CloudCascade</h1>
            <div className="cloud-container">
                {data && data.length > 0 ? (
                    data.map((file, index) => (
                        <SubFile key={index} file={file} />
                    ))
                ) : (
                    <p>No files available</p>
                )}
            </div>
            <br />
        </div>
    );
}
