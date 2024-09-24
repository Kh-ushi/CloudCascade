import './SubFile.css'
import { useNavigate } from 'react-router-dom';
export default function SubFile({key,file}){

     const navigate=useNavigate();

     const handleClick=()=>{
        navigate(`/file/${file._id}`,{state:{file}});
     }

    return(
        <div className="SubFile" onClick={handleClick}>
           <div dangerouslySetInnerHTML={{ __html: file.icon}} className='icon'></div>
           <p className='fileName'>{file.name} <span> <i class="fa-solid fa-ellipsis-vertical"></i></span></p>
           <div className='SubFileLower'></div>
            {/* <div className='SubFileLower'></div> */}

        </div>
    );
}