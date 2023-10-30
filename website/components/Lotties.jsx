import React from 'react'
import { useLottie } from "lottie-react";
import * as loadingFile from '../anim/loading.json';
import * as integrations from '../anim/integrations.json';
import * as success from '../anim/integration.json';
import * as failed from '../anim/failed.json';
import * as login from '../anim/login.json';
import * as payment from '../anim/payment.json';
 
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

export const AnimationIntegrationSuccess = (props) => <Lotties {...props} file={success} />

export const AnimationIntegrationFailed = (props) => <Lotties {...props} file={failed} />

export const AnimationLogin = (props) => <Lotties {...props} file={login} />

export const AnimationPayment = (props) => <Lotties {...props} file={payment} />

export default Lotties
