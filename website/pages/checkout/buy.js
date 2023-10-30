import Head from 'next/head';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Image from 'next/image';
import { FaApplePay, FaGooglePay } from 'react-icons/fa';
import { AnimationPayment } from '../../components/Lotties';
import FEATURES from '../../utils/features.json';


// Default Next Js Function
export async function getServerSideProps({ req, res }) {
    const dev = process.env.NODE_ENV !== 'production'
    const PAYPAL_CLIENT_ID = !dev ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_CLIENT_ID_DEV;
    const paypalsdk = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&integration-date=2023-08-02`
    const response = await fetch(dev ? 'http://localhost:3000/api/prices' : 'https://stickynotespro.m2kdevelopments.com/api/prices');
    const prices = await response.json();
    return { props: { paypalsdk, clientId: PAYPAL_CLIENT_ID, prices } };
}


function PaypalCheckout({ paypalsdk, clientId, prices }) {

    const { id } = useRouter().query;

    // Checkout Information
    const [features, setFeatures] = useState([]);
    const [name, setName] = useState("");
    const [moreNotes, setMoreNotes] = useState(40);
    const [price, setPrice] = useState(0);
    const [integration, setIntegration] = useState(false);

    useEffect(() => {
        if (!window.paypal) {
            //add script
            const script = document.createElement('script');
            script.src = paypalsdk;
            script.type = 'text/javascript';
            script.async = true;
            document.body.appendChild(script);
        }
    }, [paypalsdk]);

    useEffect(() => {
        if (prices && prices.length) {
            const p = prices.find(p => p._id == id);
            setFeatures(p.features.filter(f => f.enabled));
            setName(p.name);
            setMoreNotes(p.activate.counter);
            setIntegration(p.activate.integrations);
            setPrice(p.price);
        }
    }, [prices, id])



    function createOrder() {
        return fetch("/api/paypal/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            // use the "body" param to optionally pass additional order information
            // like product skus and quantities
            body: JSON.stringify({
                cart: [
                    {
                        sku: id,
                        quantity: "1",
                    },
                ]
            }),
        })
            .then((response) => response.json())
            .then((order) => order.id);
    }

    // Finalize the transaction on the server after payer approval
    function onApprove(data) {
        return fetch("/api/paypal/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID, id: id })
        })
            .then((response) => response.json())
            .then((orderData) => {
                // Successful capture! For dev/demo purposes:
                console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                const transaction = orderData.purchase_units[0].payments.captures[0];
                alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);
                // When ready to go live, remove the alert and show a success message within this page. For example:
                // const element = document.getElementById('paypal-button-container');
                // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                // Or go to another URL:  window.location.href = 'thank_you.html';
            });
    }

    function onCancel(data) {
        // Show a cancel page, or return to cart
    }

    // If an error prevents buyer checkout, alert the user that an error has occurred with the buttons using the onError callback:
    function onError(err) {
        // For example, redirect to a specific error page
        window.location.href = "/checkout/error";
    }

    function onGooglePlay(){
        
    }

    function onApplePlay(){

    }

    return (
        <div>
            <Head>
                <title>Sticky Notes Pro - Check Out</title>
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

            <main className="mx-auto my-8 grid mobile:grid-cols-1 laptop:grid-cols-2">
                <div className='mx-auto my-14'>
                    <Image src="/logoText.png" alt="Sticky Notes Pro" width={240} height={240} className='my-10 mx-auto text-center' />
                    <p className='text-center text-8xl text-green-900 font-bold'>${price}.00</p>
                    <p className='mx-auto text-center text-lg bg-green-200 rounded-2xl w-fit px-4'>{name}</p>
                    <br /><br />
                    <ol className='tick px-10'>
                        <li>{moreNotes} more notes 📝</li>
                        {integration ? <li>Activate API Integrations</li> : null}
                        {
                            [...FEATURES, ...features].map(
                                (feature, index) =>
                                    <li key={index}>
                                        {feature.title}
                                    </li>
                            )
                        }
                    </ol>
                </div>

                <div className='mx-24 p-10 drop-shadow-2xl rounded-lg bg-white'>

                    <AnimationPayment width={250} title="Sticky Notes Pro Checkout" />

                    <button onClick={onGooglePlay} className="my-2 flex justify-center w-full py-1 px-12 text-center bg-slate-50 hover:bg-slate-400 duration-500 cursor-pointer text-slate-800 text-lg rounded border-none"><FaGooglePay size={45} /></button>
                    <button onClick={onApplePlay} className='my-2 flex justify-center w-full py-1 px-12 text-center bg-black hover:bg-gray-800 duration-500 cursor-pointer text-white text-lg rounded border-none'><FaApplePay size={45} /></button>

                    <PayPalScriptProvider options={{ clientId: clientId }}>
                        <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onCancel={onCancel}
                            onError={onError}
                        />
                    </PayPalScriptProvider>
                </div>
            </main>

        </div>
    )
}

export default PaypalCheckout
