import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'


function ToolTip({ children, text }) {

    return (
        <OverlayTrigger placement="left-start" delay={{ show: 400, hide: 400 }}
            overlay={<Tooltip id={Math.random().toString()}>{text}</Tooltip>}>
            {children}
        </OverlayTrigger>
    )
}

export default ToolTip
