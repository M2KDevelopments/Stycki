import React from 'react'
import facebook from "../images/facebook.png";

function ButtonFacebook({ onClick }) {

    return (
        <div className='social' onClick={onClick}>
            <img src={facebook} alt="Facebook" />
        </div>
    )
}

export default ButtonFacebook