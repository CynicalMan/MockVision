import React from "react";
import "./designs.css";
import { useNavigate } from "react-router-dom";

const Designs = () => {

  const navigate = useNavigate();

  const handleButtonClick = async (sampleNo) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/convert3D/${sampleNo}`);
      const data = await response;
      console.log(data); // You can handle the response data as needed
      navigate('/view3D')
    } catch (error) {
      console.error('Error:', error);
    }
  };

  

  return (
    <>
      <div className="container">
        <div className="imgsContainer">
          <div className="img0"><button onClick={() => handleButtonClick(0)}>Create 3D Design</button></div>
          <div className="img1"><button onClick={() => handleButtonClick(1)}>Create 3D Design</button></div>
          <div className="img2"><button onClick={() => handleButtonClick(2)}>Create 3D Design</button></div>
          <div className="img3"><button onClick={() => handleButtonClick(3)}>Create 3D Design</button></div>
        </div>
      </div>
    </>
  );
};

export default Designs;
