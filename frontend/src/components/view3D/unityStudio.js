import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "./unityStudio.css"

const UnityStudio = () => {
    const { unityProvider } = useUnityContext({
        loaderUrl: "UnityFloorPlanTo3D_V3.2/Build/UnityFloorPlanTo3D_V3.2.loader.js",
        dataUrl: "UnityFloorPlanTo3D_V3.2/Build/UnityFloorPlanTo3D_V3.2.data",
        frameworkUrl: "UnityFloorPlanTo3D_V3.2/Build/UnityFloorPlanTo3D_V3.2.framework.js",
        codeUrl: "UnityFloorPlanTo3D_V3.2/Build/UnityFloorPlanTo3D_V3.2.wasm",
    });

    return <div className="flex center"><Unity unityProvider={unityProvider} /></div>;
};

export default UnityStudio;