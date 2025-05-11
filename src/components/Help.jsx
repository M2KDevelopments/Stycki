import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BiHelpCircle } from "react-icons/bi";

function Help({children, size}) {
    return (
        <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 1000 }} 
            overlay={<Tooltip id={Math.random().toString()}>{children}</Tooltip>}>
            <BiHelpCircle size={size?size:20}/>
        </OverlayTrigger>
    )
}

export default Help
