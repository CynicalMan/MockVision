import Header from "../../components/header/header";
import React from "react";
import Footer from "../../components/footer/footer";
import UnityStudio from "../../components/view3D/unityStudio";
    

const View3D = function() {

    return (
        <>
        <Header/>
        <UnityStudio />
        <Footer/>
        </>
    );

} ;

export default View3D;