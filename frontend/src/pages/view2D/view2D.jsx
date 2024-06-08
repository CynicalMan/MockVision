import Header from "../../components/header/header";
import React, { useEffect } from "react";
import Footer from "../../components/footer/footer";
import Designs from "../../components/view2D/designs";
import Aos from 'aos'

  

const View2D = function() {

    useEffect(()=>{
        Aos.init();
    });

    return (
        <>
        <Header/>
        <Designs />
        <Footer/>
        
        </>
    );

} ;

export default View2D;