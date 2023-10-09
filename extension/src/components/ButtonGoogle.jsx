import React from 'react'
import { Button } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc'

function ButtonGoogle({ onClick }) {

    return (
        <Button variant='light' onClick={onClick}>
            <FcGoogle size={22} style={{ marginRight: 10, width: 22 }} /> Continue with Google
        </Button>
    )
}

export default ButtonGoogle