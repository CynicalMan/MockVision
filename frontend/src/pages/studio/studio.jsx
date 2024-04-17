import Header from "../../components/header/header";
import React from "react";
import classes from "./studio.module.css";
import PlanifyDraw from "../../components/studio/planify-pixi";
import Footer from "../../components/footer/footer";

const Studio = function () {
  document.title = "Home Desgin";

  return (
    <>
      <div className={classes.studio}>
        <Header />
        <PlanifyDraw style={{ marginTop: 0, paddingBottom: 0 }} />
        <Footer />
      </div>
    </>
  );
};
export default Studio;
