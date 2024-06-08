import React from 'react';
import './section1.css';
import {Link} from 'react-router-dom';


const Section1 = ()=>{

    return (

        <>
            <div className='section1'>
                <div className='text'>
                    <h1> Design your house using AI </h1>
                    <p> we gave 5000+ review and out customers trust on our properity and Quailty prouducts</p>
                    <div className='section1-buttons'>
                        <Link to="/Drawing"><button className='CreateNow'>Create Now</button></Link>
                        <button className='explore'>explore</button>
                    </div>
                </div>
            </div>
        </>
    );


};


export default Section1 ;