
import './ProgressBar.css';

const ProgressBar=({progress})=>(
    <div>
        <div className="progress-container">
            <div className="progress-bar" style={{width:`${progress}%`}}> Uploading In Progress</div>
        </div>
    </div>
);

export default ProgressBar;