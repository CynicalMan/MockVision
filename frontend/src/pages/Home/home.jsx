import React from "react";
import Footer from "../../components/footer/footer";
import Section1 from "../../components/Home/section1";
import Header from "../../components/header/header";
import Section2 from "../../components/Home/section2";
import Aos from 'aos';
import  { useEffect } from "react";

const Home = function() {

    useEffect(()=>{
        Aos.init();
    });


    return(
        <>
        <Header />

        <Section1/>
        <Section2 />

        <Footer/>
        </>
    );


} ;

export default Home;