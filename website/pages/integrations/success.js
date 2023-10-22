import Head from 'next/head'
import React from 'react'
import { AnimationIntegrationSuccess } from '../../components/Lotties'
import Image from 'next/image'

function PageIntegrationSuccess() {
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
            <main className='center my-20 text-center justify-center flex align-middle flex-col'>
                <Image className='m-auto' width={200} height={200} src="logoText.png" alt="Sticky Notes Pro" />
                <AnimationIntegrationSuccess width={400} title="API Integration Successful" />
            </main>
        </div>
    )
}

export default PageIntegrationSuccess
