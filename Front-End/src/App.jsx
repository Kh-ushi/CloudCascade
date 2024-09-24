import { useState } from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import FileDetails from './Pages/FileDetails';
import InfoBar from './InfoBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  const[refresh,setRefresh]=useState(true);
  
  const[isUser,setIsUser]=useState(null);

  const getUser=(id)=>{
    setIsUser(id);
  }

  const refreshComp=()=>{
    setRefresh(prev=>!prev);
  }

  return (
    <Router>
      <div>
        <InfoBar getUser={getUser} refresh={refresh} ></InfoBar>
        <Routes>
          <Route path="/" element={<HomePage user={isUser} refresh={refresh} refreshComp={refreshComp}/>} />
          <Route path="/file/:id" element={<FileDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

