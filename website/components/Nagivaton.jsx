import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';

function Nagivaton() {

    const [menu, setMenu] = useState(false);

    return (
        <nav className='w-full drop-shadow px-10 bg-white sticky top-0 z-10 py-3 bg-opacity-95'>
            <div className='flex text-center text-xl '>

                <div className='w-[70%]'>
                    <Link href="/">
                        <Image src="/logo512.png" alt="Sticky Notes Pro" width={40} height={40} />
                    </Link>
                </div>

                <div className='flex justify-end text-right mobile:hidden phone:hidden tablet:hidden laptop:block'>
                    <Link className='px-2 hover:text-cyan-700 transition-all duration-200' href="https://youtube.com">Tutorials</Link>
                    <Link className='px-2 hover:text-purple-700 transition-all duration-200' href="https://support.m2kdevelopments.com">Help Desk</Link>
                    <Link className='px-2 hover:text-pink-600 transition-all duration-200' href="/support">Support</Link>
                    <Link className='px-2 text-blue-900 font-bold hover:text-pink-600 transition-all duration-200' href="https://chrome.google.com/webstore/detail/gnpgjlgmdekplbmfpokppoajajdkdkdp">Get Extension</Link>
                </div>

                <div className='laptop:hidden w-[30%] flex items-center justify-end'>
                    <button aria-label="Menu Navigation" onClick={() => setMenu(!menu)} className='p-3 transition-all duration-500 hover:bg-blue-500 rounded-full'>
                        <GiHamburgerMenu color="grey" size={27} />
                    </button>
                    {
                        menu ?
                            <ul className='text-lg z-40 fixed top-24 right-4 p-2 bg-blue-950 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100 drop-shadow-2xl'>
                                <li><Link href="https://youtube.com"><span tabIndex={0} className='font-bold py-2 text-white transition-all duration-200 hover:text-blue-500 cursor-pointer'>Tutorials</span></Link></li>
                                <li><Link href="https://support.m2kdevelopments.com"><span tabIndex={1} className='font-bold py-2 text-white transition-all duration-200 hover:text-blue-500 cursor-pointer'>Help Desk</span></Link></li>
                                <li><Link href="/support"><span tabIndex={2} className='font-bold py-2 text-white transition-all duration-200 hover:text-blue-500 cursor-pointer'>Support</span></Link></li>
                                <li><Link href="https://chrome.google.com/webstore/detail/gnpgjlgmdekplbmfpokppoajajdkdkdp"><button tabIndex={3} className='font-bold py-2 text-white bg-blue-800 p-2 rounded flex justify-items-center align-middle transition-all duration-100 hover:bg-blue-950 cursor-pointer'><FaCloudDownloadAlt style={{ marginRight: 10 }} size={18} /> Downloads</button></Link></li>
                            </ul> : null
                    }
                </div>
            </div>
        </nav>
    )
}

export default Nagivaton
