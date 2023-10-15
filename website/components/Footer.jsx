import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Footer() {

  return (
    <footer className="bg-gradient-to-r from-slate-400 to-purple-700 py-8">
      <div className='p-4 grid grid-cols-1 phone:grid-cols-1 tablet:grid-cols-3 laptop:grid-cols-4'>
        <Image src="/logoText.png" width={300} height={300} alt="Logo" />
        <div aria-label="Quick Links" className='w-full'>
          <h3 className='text-3xl font-bold text-purple-300 py-4'>Links</h3>
          <br />
          <Link className='text-white mobile:text-2xl tablet:text-lg w-full block transition-all duration-300 hover:text-slate-300' href="/support#faq">FAQ</Link>
          <Link className='text-white mobile:text-2xl tablet:text-lg w-full block transition-all duration-300 hover:text-slate-300' href="/developers">Developers</Link>
          <Link className='text-white mobile:text-2xl tablet:text-lg w-full block transition-all duration-300 hover:text-slate-300' href="/suggestion">Suggestion Box</Link>
          <Link className='text-white mobile:text-2xl tablet:text-lg w-full block transition-all duration-300 hover:text-slate-300' href="/privacypolicy">Privacy Policy</Link>
          <Link className='text-white mobile:text-2xl tablet:text-lg w-full block transition-all duration-300 hover:text-slate-300' href="/terms">Terms</Link>
          <p className='text-slate-300'>We value your privacy. We do not collect or store your browsing history or personal data.</p>
        </div>
        
      </div>
      <div className='w-full text-right px-10'>
        <p>© 2023 <Link aria-label="Main Website" className="text-slate-200" href="https://m2kdevelopments.com">M2k Developments</Link>. All rights reserved</p>
      </div>
    </footer>

  )
}

export default Footer
