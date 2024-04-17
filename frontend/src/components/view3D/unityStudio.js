import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "./unityStudio.css"

const UnityStudio = () => {
    const { unityProvider } = useUnityContext({
        loaderUrl: "UnityFloorPlanTo3D/Build/UnityFloorPlanTo3D.loader.js",
        dataUrl: "UnityFloorPlanTo3D/Build/UnityFloorPlanTo3D.data",
        frameworkUrl: "UnityFloorPlanTo3D/Build/UnityFloorPlanTo3D.framework.js",
        codeUrl: "UnityFloorPlanTo3D/Build/UnityFloorPlanTo3D.wasm",
    });

    return <div className="flex center"><Unity unityProvider={unityProvider} /></div>;
};

export default UnityStudio;