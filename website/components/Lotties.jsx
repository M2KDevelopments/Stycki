import React from 'react'
import { useLottie } from "lottie-react";
import * as loadingFile from '../anim/loading.json';
import * as integrations from '../anim/integrations.json';
 
function Lotties({ file, title, description, width }) {

  function Lottie(props) {
    const options = {
      animationData: props.lottie.default,
      loop: true,
      autoplay: true,
      "aria-label":""
    };

    const { View } = useLottie(options);
    return View;
  }

  return (
    <div className={`text-center align-middle m-auto`} style={{ width }}>
      <Lottie lottie={file} loop={true} />
      <span className="text-lg">{title}</span>
      <p><i>{description}</i></p>
    </div>
  )
}

export const AnimationLoading = (props) => <Lotties {...props} file={loadingFile} />

export const AnimationIntegration = (props) => <Lotties {...props} file={integrations} />

 
export default Lotties
