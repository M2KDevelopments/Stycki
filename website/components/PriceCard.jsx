import Link from 'next/link'
import React from 'react'

function PriceCard({ title, price, discount, features, description, url, popular }) {
  return (
    <div style={{ position: popular ? "relative" : "", top: popular ? -80 : "" }} className='border-t-purple-700 border-t-8 text-center p-2 drop-shadow-xl bg-white rounded-2xl w-full max-w-[350px] my-11'>
      <h4 aria-label={description} className='text-3xl text-purple-600'>{title}</h4>
      <br />
      <p className='text-sm'><i>{description}</i></p>
      <br />
      <p className='text-6xl text-purple-950'>
        {discount ? <span className='text-purple-600 text-2xl line-through'>${price}</span> : null}
        ${parseInt(price * ((100 - discount) / 100.0))}
        <span className='text-purple-600 text-xl'>/month</span></p>
      <br />
      <Link href={url} className='rounded-lg drop-shadow bg-white px-4 w-[200px] text-2xl my-4 transition-all duration-300 hover:bg-purple-500'>{price ? "Buy" : "Download"}</Link>

      <ul className='text-left space-y-2 my-10'>
        {
          features.map((feature, index) => (
            <li key={'title' + index}><span className='mx-2'>{feature.enabled ? "✅" : "❌"}</span>{feature.title}</li>
          ))
        }
      </ul>

    </div>
  )
}

export default PriceCard
