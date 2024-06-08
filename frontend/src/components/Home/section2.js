import React from "react";
import "./section2.css";
import "aos/dist/aos.css";

const Section2 = () => {
  return (
    <>
      <div className="section2">
        <h1>Features</h1>
        <div className="features">
          <div className="div1" data-aos="flip-right" data-aos-duration="1200">
            <h2>AI</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sit amet elementum urna. Ut et tincidunt urna, porttitor
            </p>
        
          </div>
          {/* <div className='img1'></div> */}
          <div className="div2" data-aos="flip-right" data-aos-duration="1200">
            <h2>Many 2D Designs</h2>
            <p>hsgdfahsdgf</p>
          </div>
          {/* <div className='img2'></div> */}
          <div className="div3" data-aos="flip-right" data-aos-duration="1200">
            <h2>3D & interior Design</h2>
            <p>hsgdfahsdgf</p>
          </div>
          {/* <div className='img3'></div> */}
        </div>
      </div>
    </>
  );
};
//   data-aos = "fade"  data-aos-duration="2000"
export default Section2;
