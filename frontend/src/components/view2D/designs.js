import React from "react";
import AOS from 'aos'
import "./designs.css";
import 'aos/dist/aos.css'
import { useNavigate } from "react-router-dom";



const Designs = () => {



  const navigate = useNavigate();
  const handleButtonClick = async (sampleNo) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/convert3D/${sampleNo}`
      );
      const data = await response;
      console.log(data); // You can handle the response data as needed
      navigate("/view3D");
    } catch (error) {
      console.error("Error:", error);
    }
  };





  return (
    <>
      <div className="imgsContainer">
        <div className="img0Section ">
          <div className="img0 hidden" onClick={() => handleButtonClick(0)} data-aos = "fade-left"  data-aos-duration="2000"></div>
            <p>Design 1  Recommended</p>
        </div>
        <div className="img1Section ">
          <div className="img1 hidden" onClick={() => handleButtonClick(1)} data-aos = "fade-right"  data-aos-duration="2000"></div>
          <p>Design 2</p>
        </div>
        <div className="img2Section ">
          <div className="img2 hidden" onClick={() => handleButtonClick(2)}  data-aos ="fade-left"   data-aos-duration="2000"></div>
          <p>Design 3</p>
        </div>
        <div className="img3Section ">
          <div className="img3 hidden" onClick={() => handleButtonClick(3)} data-aos="fade-right"  data-aos-duration="2000"></div>
          <p>Design 4</p>
        </div>

        {/* <div className="img3"><button onClick={() => handleButtonClick(3)}>Create 3D Design</button></div> */}
      </div>
    </>
  );
};




export default Designs;
