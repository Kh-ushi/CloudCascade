import React, { useState } from 'react';
import "./HomePage.css";
import SideBar from '../HomePageComp/SideBar';
import MainBar from '../HomePageComp/MainBar';
import LastBar from '../HomePageComp/LastBar';

const HomePage = ({ user,refresh,refreshComp,isDeleted,setIsDeleted}) => {

  
  const [selectedOption, setSelectedOption] = useState('DashBoard');

  const [retrievedData, setRetrievedData] = useState(null);

  const handleSelection = (option) => {
    setSelectedOption(option);
  }

  const getData = (data) => {
    setRetrievedData(data);
  }

  return (
    <div className='HomePage'>
      <SideBar
        onSelect={handleSelection}
        selected={selectedOption}
        getData={getData}
        user={user}
        isDeleted={isDeleted}
      />

      <MainBar 
        selectedOption={selectedOption} 
        retrievedData={retrievedData} 
        onSelect={handleSelection}
        refresh={refresh}
        refreshComp={refreshComp}
        setIsDeleted={setIsDeleted}
        isDeleted={isDeleted}
      />
      <LastBar selectedOption={selectedOption} />
    </div>
  );
}

export default HomePage;