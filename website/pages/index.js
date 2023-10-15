import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Parallax } from "react-parallax";
import { TypeAnimation } from 'react-type-animation';
import { Slide, Fade, } from "react-awesome-reveal";
import YouTube from 'react-youtube';
import Footer from '../components/Footer';
import { Accordion, AccordionItem, AccordionItemButton, AccordionItemHeading, AccordionItemPanel } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import FAQ from '../utils/faq.json';
import AnimatedSticked from '../components/AnimatedSticked';
import { AnimationGoogleSheets, AnimationIntegration } from '../components/Lotties';

export default function Home() {
  return (
    <div >
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

      {/* Navigation */}
      <nav className='w-full drop-shadow px-10 bg-white sticky top-0 z-10 py-3 bg-opacity-95'>
        <div className='flex text-center text-xl '>

          <div className='w-[70%]'>
            <Link href="/">
              <Image src="/logo512.png" alt="Sticky Notes Pro" width={40} height={40} />
            </Link>
          </div>

          <div className='flex justify-end text-right'>
            <Link className='px-2 hover:text-cyan-700' href="https://m2kdevelopments.com">About Us</Link>
            <Link className='px-2 hover:text-purple-700' href="https://support.m2kdevelopments.com">Help Desk</Link>
            <Link className='px-2 hover:text-pink-600' href="/support">Support</Link>
            <Link className='px-2 text-blue-900 font-bold hover:text-pink-600' href="https://chrome.google.com/webstore/detail/gnpgjlgmdekplbmfpokppoajajdkdkdp">Get Extension</Link>
          </div>
        </div>
      </nav>

      <main className='max-w-6xl justify-end self-center mx-auto px-6'>

        <AnimatedSticked />

        {/* Title Section */}
        <section className='mx-auto my-14'>
          <Image src="/logoText.png" alt="Sticky Notes Pro" width={350} height={350} className='my-10 mx-auto text-center' />
          <h1 className='hidden'>Sticky Notes Pro</h1>
          <p className='text-xl'>Welcome to Sticky Notes Pro, your ultimate solution for enhancing your web browsing experience. Our innovative Chrome extension empowers you to create, customize, and manage sticky notes directly on any webpage. Whether you want to jot down ideas, set reminders, or annotate web content, Sticky Notes Pro has you covered. Elevate your productivity and organization while exploring the internet, all with the help of Sticky Notes Pro.</p>
          <Slide>
            <div className='mx-auto w-[80%] my-14'>
              <Link className='flex p-6 mobile:text-2xl tablet:text-5xl drop-shadow-md bg-white hover:bg-slate-400 rounded-md' href="https://chrome.google.com/webstore/detail/gnpgjlgmdekplbmfpokppoajajdkdkdp" target='_blank'>
                <Image src="/chrome.png" alt="Sticky Notes Pro" width={60} height={30} />
                <span className='px-3'>Try Our Extension</span>
              </Link>
            </div>
          </Slide>
        </section>


        <section className='mx-auto w-full text-center my-[70px]'>
          <div className='mobile:hidden tablet:block my-16 drop-shadow-2xl p-2 bg-[#FFFFFF66] w-[80%] h-fit'>
            <YouTube videoId="0vAi1V-_r6I"
              title="Sticy Notes Pro"
              opts={{
                height: '440',
                width: '100%',
                playerVars: {
                  // https://developers.google.com/youtube/player_parameters
                  autoplay: 1,
                  origin: process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://stickynotespro.m2kdevelopments.com'
                },
              }}
              onReady={(event) => event.target.pauseVideo()} />
          </div>
        </section>


        {/* Features */}
        <section className='mx-auto my-8 grid mobile:grid-cols-1 tablet:grid-cols-2'>
          <div className='w-fit h-96 drop-shadow-md rounded-xl'>
            <div className='h-fit w-full px-5 bg-yellow-300 text-4xl p-3'>
              What You Will Get!
            </div>
            <div className='p-4 bg-yellow-200'>
              <TypeAnimation
                sequence={[
                  'Responsive Design',
                  1000,
                  'Intuitive User Interface',
                  1000,
                  'Customizable Themes',
                  1000,
                  'Search Functionality',
                  1000,
                  'Multi-browser Support',
                  1000,
                  'Accessibility Compliance',
                  1000,
                  'High-Resolution Graphics',
                  1000,
                  'Interactive Animations',
                  1000,
                  'Offline Mode',
                  1000,
                  'Real-time Collaboration',
                  1000,
                ]}
                speed={50}
                style={{ fontSize: '2em' }}
                repeat={Infinity}
              />
            </div>
          </div>
          <div>
            <h2 className='text-6xl my-4'>Features</h2>
            {/* Styles in the css file */}
            <ol>
              <li>Responsive Design</li>
              <li>Intuitive User Interface</li>
              <li>Customizable Themes</li>
              <li>Search Functionality</li>
              <li>Multi-browser Support</li>
              <li>Accessibility Compliance</li>
              <li>High-Resolution Graphics</li>
              <li>Interactive Animations</li>
              <li>Offline Mode</li>
              <li>Real-time Collaboration</li>
            </ol>
          </div>
        </section>

        {/* Extra Download Section */}
        <section className='mx-auto my-72'>
          <Slide>
            <div className='mx-auto w-[80%]'>
              <Link className='flex p-6 mobile:text-2xl tablet:text-5xl drop-shadow-md bg-yellow-300 hover:bg-slate-400 rounded-md' href="https://chrome.google.com/webstore/detail/gnpgjlgmdekplbmfpokppoajajdkdkdp" target='_blank'>
                Start Using Sticky Notes Pro TODAY!
              </Link>
            </div>
          </Slide>
        </section>


        {/* Integrations */}
        <section className='mx-auto my-10 grid mobile:grid-cols-1 tablet:grid-cols-2'>
          <div>
            <h2 className='text-6xl my-4'>Integrations</h2>
            {/* Styles in the css file */}
            <ol>
              <li>Google Drive</li>
              <li>Google Sheets</li>
              <li>Evernote</li>
              <li>Notion</li>
              <li>Drop Box</li>
              <li>Slack</li>
              <li>Trello</li>
              <li>Twilio</li>
              <li>CSVs</li>
              <li>Synthesia</li>
            </ol>
          </div>
          <AnimationIntegration />
        </section>


        {/* FAQ */}
        <section className='my-14'>

          <h2 className='font-bold mobile:text-3xl tablet:text-6xl text-purple-800 my-12'>Frequently Asked Questions</h2>

          <Accordion>
            {
              FAQ.map((faq, index) =>
                <AccordionItem key={index}>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      {faq.question}
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      {faq.answer}
                    </p>
                  </AccordionItemPanel>
                </AccordionItem>
              )
            }
          </Accordion>
        </section>

      </main>

      <Footer />
    </div >
  )
}
