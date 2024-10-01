import { useState, useEffect } from 'react';
import './App.css';
import HomePage from './Pages/HomePage';
import FileDetails from './Pages/FileDetails';
import InfoBar from './InfoBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [refresh, setRefresh] = useState(true);
  const [isUser, setIsUser] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    console.log("IsDelete is changed: in App.jsx", isDeleted);
  }, [isDeleted]);

  const getUser = (id) => {
    setIsUser(id);
  };

  const refreshComp = () => {
    setRefresh(prev => !prev);
  };

  return (
    <Router>
      <div>
        <InfoBar getUser={getUser} refresh={refresh} />
        <Routes>
          <Route path="/" element={<HomePage user={isUser} refresh={refresh} refreshComp={refreshComp} isDeleted={isDeleted} setIsDeleted={setIsDeleted} />} />
          <Route path="/file/:id" element={<FileDetails isDeleted={isDeleted} setIsDeleted={setIsDeleted} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
