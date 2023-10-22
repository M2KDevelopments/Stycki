import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import AnimatedSticked from '../components/AnimatedSticked'
 
function PageInstall() {
    return (
        <div>
            <Head>
                <title>Sticky Notes Pro</title>
                <meta name="description" content="Stick Notes Pro is a dedicated Chrome extension designed to simplify your online life. Its single purpose is to provide you with a seamless way to create and manage sticky notes on webpages. Never again will you forget important information or tasks while browsing. Harness the power of Stick Notes Pro to effortlessly add virtual sticky notes to your favorite websites, ensuring you stay organized and productive." />
                <link rel="icon" href="/favicon.ico" />

                {/* Facebook */}
                <meta property="og:title" content="Sticky Notes Pro" />
                <meta property="og:description" content="Stick Notes Pro is a dedicated Chrome extension designed to simplify your online life. Its single purpose is to provide you with a seamless way to create and manage sticky notes on webpages. Never again will you forget important information or tasks while browsing. Harness the power of Stick Notes Pro to effortlessly add virtual sticky notes to your favorite websites, ensuring you stay organized and productive." />
                <meta property="og:image" content="/logoText.png" />
                <meta property="og:url" content="https://stickynotespro.m2kdevelopments.com" />
                <meta property="og:type" content="website" />

                <meta name="twitter:title" content="Sticky Notes Pro" />
                <meta name="twitter:description" content="Stick Notes Pro is a dedicated Chrome extension designed to simplify your online life. Its single purpose is to provide you with a seamless way to create and manage sticky notes on webpages. Never again will you forget important information or tasks while browsing. Harness the power of Stick Notes Pro to effortlessly add virtual sticky notes to your favorite websites, ensuring you stay organized and productive." />
                <meta name="twitter:image" content="/logoText.png" />
                <meta name="twitter:card" content="/bannerText.png" />

                {/* pinterest */}
                <meta name="pinterest-rich-pin" content="true" />
            </Head>

            <main className='max-w-6xl justify-end self-center mx-auto px-6'>
                <AnimatedSticked />

                {/* Title Section */}
                <section className='mx-auto my-14'>
                    <Image src="/logoText.png" alt="Sticky Notes Pro" width={350} height={350} className='my-10 mx-auto text-center' />
                    <h1 className='hidden'>Sticky Notes Pro</h1>
                    <p className='text-xl'>Welcome to Sticky Notes Pro, your ultimate solution for enhancing your web browsing experience. Our innovative Chrome extension empowers you to create, customize, and manage sticky notes directly on any webpage. Whether you want to jot down ideas, set reminders, or annotate web content, Sticky Notes Pro has you covered. Elevate your productivity and organization while exploring the internet, all with the help of Sticky Notes Pro.</p>

                </section>
            </main>


        </div>
    )
}

export default PageInstall
