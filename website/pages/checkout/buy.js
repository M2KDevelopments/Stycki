import Head from 'next/head';
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Default Next Js Function
export async function getServerSideProps({ req, res }) {
    const dev = process.env.NODE_ENV !== 'production'
    const PAYPAL_CLIENT_ID = !dev ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_CLIENT_ID_DEV;
    const paypalsdk = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&integration-date=2023-08-02`
    return { props: { paypalsdk, clientId: PAYPAL_CLIENT_ID } };
}


function PaypalCheckout({ paypalsdk, clientId }) {
    const { id } = useRouter().query;

    useEffect(() => {
        if (!window.paypal) {
            //add script
            const script = document.createElement('script');
            script.src = paypalsdk;
            script.type = 'text/javascript';
            script.async = true;
            document.body.appendChild(script);
        }
    }, [id, paypalsdk]);



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

            <PayPalScriptProvider options={{ clientId: clientId }}>
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onCancel={onCancel}
                    onError={onError}
                />
            </PayPalScriptProvider>
        </div>
    )
}

export default PaypalCheckout
