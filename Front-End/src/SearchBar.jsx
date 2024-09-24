import './SearchBar.css';

export default function SearchBar({searchQuery,setSearchQuery}){
    return(
        <div className="SearchBar">
            <span><i class="fa-solid fa-magnifying-glass"></i></span>
            <input type="text"
             value={searchQuery}
             onChange={(e)=>setSearchQuery(e.target.value)}
             placeholder='Search Files ...'/>
        </div>
    );
}