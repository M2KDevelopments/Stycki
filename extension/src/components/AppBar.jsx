import React from 'react'
import { Container } from 'react-bootstrap'
import Footer from './Footer'
// import Logo from './Logo'
import Navigation from './Navigation'

function AppBar({ children, nologo }) {
    return (
        <div>
            {/* {nologo ? null : <Logo />} */}
            <Navigation />
            <Container>
                {children}
            </Container>
            <Footer />
        </div>
    )
}

export default AppBar