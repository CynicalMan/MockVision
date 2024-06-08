import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import { Fragment } from "react";
import Studio from "./pages/studio/studio";
import Footer from './components/footer/footer';
import View2D from "./pages/view2D/view2D";
import View3D from "./pages/view3D/view3D";
import Home from "./pages/Home/home"


function App() {

  return (

    <Fragment>
      <BrowserRouter>
        <div>
          {/* {window.location.pathname !== "/" && <Header />} */}
        </div>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/view2D" element={<View2D/>} />
          <Route path="/view3D" element={<View3D/>} />
          <Route path="/Drawing" element={<Studio />} />
        </Routes>

        <div>
          {/* {window.location.pathname !== "/" && <Footer />} */}
        </div>

      </BrowserRouter>
    </Fragment>
  );
}
export default App;
