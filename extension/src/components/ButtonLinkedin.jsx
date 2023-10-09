import React from 'react'
import { Button } from 'react-bootstrap';
import { FaLinkedin } from 'react-icons/fa';

function ButtonLinkedin({ onClick }) {

    return (
        <Button variant='primary' onClick={onClick}>
            <FaLinkedin size={22} style={{ marginRight: 10 , width:22 }} /> Continue with Linkedin
        </Button>
    )
}

export default ButtonLinkedin