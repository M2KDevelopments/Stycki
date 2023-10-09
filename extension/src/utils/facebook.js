/* eslint-disable no-undef */

/**
 * 
 * Author: Martin Kululanga
 * Github: https://github.com/m2kdevelopments
 * 
*/

import * as OAUTH from './oauth_window';
import * as API from './api';

// from https://developer.facebook.com/

export async function login() {
    //open window for the user to login
    const url = `${API.URL}/api/facebook/oauth`;
    const result = await OAUTH.openOAuthWindow(url, "Facebook");
    return result;
}



/** This is code inspired by El Messenger Pro */
export async function loadAudioBlob(audioURL) {
    //Downloading Audio 
    console.log('Downloading Audio')
    const audio = await fetch(audioURL, { method: "GET" });
    const blob = await audio.blob();
    const mime = "audio/wav"
    const audioBlob = blob.slice(0, blob.size, mime)
    console.log('Audio Blob', audioBlob);
    return audioBlob;
}

export async function loadImageBlob(url) {
    //Downloading Audio 
    console.log('Downloading Image')
    const img = await fetch(url, { method: "GET" });
    const blob = await img.blob();
    const mime = "image/png"
    const imageBlob = blob.slice(0, blob.size, mime)
    console.log('Image Blob', imageBlob);
    return imageBlob;
}


/** This is code inspired by El Messenger Pro */
export async function getCredientials() {
    let fbdtsg = "";
    let fbid = "";

    // Get Access Token and Such
    const ocelot = await fetch('https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed')
    const json = (JSON.parse((await ocelot.text()).replace("for (;;);", "")));

    for (const action of json.payload.actions) {
        const dom = new DOMParser().parseFromString(action.html, "text/html");
        const element = dom.querySelector('[name="fb_dtsg"]');
        fbdtsg = element.getAttribute('value');

        const elementUID = dom.querySelector('[name="target"]');
        fbid = elementUID.getAttribute('value');
        console.log('fbdtsg', fbdtsg);
        console.log('Facebook ID', fbid);
        break;
    }

    return {
        fbdtsg, fbid
    }
}

/** This is code inspired by El Messenger Pro */
export async function sendFacebookMessage(FACEBOOK_ID, MESSAGE, imageBlob, audioBlob, credentials) {


    const { fbdtsg, fbid } = credentials;

    // Idea from El Messenger
    const sID = Math.floor(Math.random() * 9007199254740991) + 1;
    const sessionID = Math.floor(Math.random() * 9007199254740991) + 1;
    const USER_ID = fbid;
    const deviceID = crypto.randomUUID();
    const REGION = "odn";
    const FB_DTSG = fbdtsg;
    const PULL_URL = `https://edge-chat.facebook.com/mqtt/pull?region=${REGION}&sid=${sessionID}`;
    const optID = 7078042206345442000 + Date.now();


    // Creating Session
    await fetch(`${PULL_URL}&chunked=true`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        keepalive: true,
        "referrer": "https://www.facebook.com",
        "referrerPolicy": "strict-origin-when-cross-origin",
        headers: {
            'Origin': "https://www.facebook.com",
            "Referer": "https://www.facebook.com",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        body: JSON.stringify({
            "u": USER_ID,
            "s": sID,
            "cp": 3,
            "ecp": 10,
            "chat_on": false,
            "fg": false,
            "d": deviceID,
            "ct": "websocket",
            "mqtt_sid": "",
            "aid": 219994525426954,
            "st": [
                "/t_ms",
                "/thread_typing",
                "/orca_typing_notifications",
                "/notify_disconnect"
            ],
            "pm": [],
            "dc": "",
            "no_auto_fg": true,
            "gas": null,
            "pack": [],
            "php_override": "",
            "p": null,
            "a": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "aids": null
        })
    });

    // Create Image Uploda
    if(imageBlob){
        const imageFormData = new FormData();
        imageFormData.append('fb_dtsg', FB_DTSG);
        // audioFormData.append('voice_clip', true) should audio
        imageFormData.append('upload_1024', imageBlob);

        // Uploading Audio
        const audioresponse = await fetch(`https://upload.facebook.com/ajax/mercury/upload.php?__a=1`, {
            method: "POST",
            credentials: "include",
            body: imageFormData
        });

        // Get Upload Id
        const imgData = JSON.parse((await audioresponse.text()).replace("for (;;);", ""));
        const image_id = imgData.payload.metadata['0'].image_id;

        // Send Image
        await fetch(`${PULL_URL}&action=send`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            "referrer": "https://www.facebook.com",
            "referrerPolicy": "strict-origin-when-cross-origin",
            headers: {
                'Origin': "https://www.facebook.com",
                "Referer": "https://www.facebook.com",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            body: JSON.stringify({
                "u": USER_ID,
                "s": sID,
                "cp": 3,
                "ecp": 10,
                "chat_on": true,
                "fg": false,
                "d": deviceID,
                "ct": "websocket",
                "mqtt_sid": "",
                "aid": 219994525426954,
                "st": [],
                "pm": [
                    {
                        "topic": "/ls_req",
                        "payload": JSON.stringify({
                            app_id: "2220391788200892",
                            request_id: 117,
                            type: 3,
                            payload: JSON.stringify({
                                tasks: [{
                                    label: "46",
                                    payload: JSON.stringify({
                                        attachment_fbids: [image_id],
                                        thread_id: FACEBOOK_ID,
                                        otid: optID,
                                        source: 524289,
                                        send_type: 3,
                                        sync_group: 1,
                                        text: MESSAGE,
                                        initiating_source: 0,
                                        skip_url_preview_gen: 0
                                    }),
                                    queue_name: FACEBOOK_ID,
                                    task_id: 20,
                                    failure_count: null
                                }, {
                                    label: "21",
                                    payload: JSON.stringify({
                                        thread_id: FACEBOOK_ID,
                                        last_read_watermark_ts: Date.now(),
                                        sync_group: 1
                                    }),
                                    queue_name: FACEBOOK_ID,
                                    task_id: 47,
                                    failure_count: null
                                }],
                                epoch_id: 7057587364733788238,
                                version_id: "5527781080656534",
                                data_trace_id: "#eVgPdkLxSYaF+9mPGycqng"
                            }),
                        }),
                        "qos": 1
                    }
                ],
                "dc": "",
                "no_auto_fg": true,
                "gas": null,
                "pack": [],
                "php_override": "",
                "p": null,
                "a": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                "aids": null
            })
        });

    }

    // Creating Audio Upload
    if (audioBlob) {
        const audioFormData = new FormData();
        audioFormData.append('fb_dtsg', FB_DTSG);
        audioFormData.append('voice_clip', true)
        audioFormData.append('upload_1024', audioBlob);

        // Uploading Audio
        const audioresponse = await fetch(`https://upload.facebook.com/ajax/mercury/upload.php?__a=1`, {
            method: "POST",
            credentials: "include",
            body: audioFormData
        });

        // Get Upload Id
        const audioData = JSON.parse((await audioresponse.text()).replace("for (;;);", ""));
        console.log(audioData)
        const audio_id = audioData.payload.metadata['0'].audio_id;

        // Send Audio
        const a = await fetch(`${PULL_URL}&action=send`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            "referrer": "https://www.facebook.com",
            "referrerPolicy": "strict-origin-when-cross-origin",
            headers: {
                'Origin': "https://www.facebook.com",
                "Referer": "https://www.facebook.com",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            body: JSON.stringify({
                "u": USER_ID,
                "s": sID,
                "cp": 3,
                "ecp": 10,
                "chat_on": true,
                "fg": false,
                "d": deviceID,
                "ct": "websocket",
                "mqtt_sid": "",
                "aid": 219994525426954,
                "st": [],
                "pm": [
                    {
                        "topic": "/ls_req",
                        "payload": JSON.stringify({
                            app_id: "2220391788200892",
                            request_id: 117,
                            type: 3,
                            payload: JSON.stringify({
                                tasks: [{
                                    label: "46",
                                    payload: JSON.stringify({
                                        attachment_fbids: [audio_id],
                                        thread_id: FACEBOOK_ID,
                                        otid: optID,
                                        source: 524289,
                                        send_type: 3,
                                        sync_group: 1,
                                        text: MESSAGE,
                                        initiating_source: 0,
                                        skip_url_preview_gen: 0
                                    }),
                                    queue_name: FACEBOOK_ID,
                                    task_id: 20,
                                    failure_count: null
                                }, {
                                    label: "21",
                                    payload: JSON.stringify({
                                        thread_id: FACEBOOK_ID,
                                        last_read_watermark_ts: Date.now(),
                                        sync_group: 1
                                    }),
                                    queue_name: FACEBOOK_ID,
                                    task_id: 47,
                                    failure_count: null
                                }],
                                epoch_id: 7057587364733788238,
                                version_id: "5527781080656534",
                                data_trace_id: "#eVgPdkLxSYaF+9mPGycqng"
                            }),
                        }),
                        "qos": 1
                    }
                ],
                "dc": "",
                "no_auto_fg": true,
                "gas": null,
                "pack": [],
                "php_override": "",
                "p": null,
                "a": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                "aids": null
            })
        });

        console.log(a);
    }

    // Send Message
    await fetch(`${PULL_URL}&action=send`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        "referrer": "https://www.facebook.com",
        "referrerPolicy": "strict-origin-when-cross-origin",
        headers: {
            'Origin': "https://www.facebook.com",
            "Referer": "https://www.facebook.com",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        body: JSON.stringify({
            "u": USER_ID,
            "s": sID,
            "cp": 3,
            "ecp": 10,
            "chat_on": true,
            "fg": false,
            "d": deviceID,
            "ct": "websocket",
            "mqtt_sid": "",
            "aid": 219994525426954,
            "st": [],
            "pm": [
                {
                    "topic": "/ls_req",
                    "payload": JSON.stringify({
                        app_id: "2220391788200892",
                        request_id: 117,
                        type: 3,
                        payload: JSON.stringify({
                            tasks: [{
                                label: "46",
                                payload: JSON.stringify({
                                    thread_id: FACEBOOK_ID,
                                    otid: optID,
                                    source: 524289,
                                    send_type: 1,
                                    sync_group: 1,
                                    text: MESSAGE,
                                    initiating_source: 0,
                                    skip_url_preview_gen: 0
                                }),
                                queue_name: FACEBOOK_ID,
                                task_id: 46,
                                failure_count: null
                            }, {
                                label: "21",
                                payload: JSON.stringify({
                                    thread_id: FACEBOOK_ID,
                                    last_read_watermark_ts: Date.now(),
                                    sync_group: 1
                                }),
                                queue_name: FACEBOOK_ID,
                                task_id: 47,
                                failure_count: null
                            }],
                            epoch_id: 7057587364733788238,
                            version_id: "5527781080656534",
                            data_trace_id: "#eVgPdkLxSYaF+9mPGycqng"
                        }),
                    }),
                    "qos": 1
                }
            ],
            "dc": "",
            "no_auto_fg": true,
            "gas": null,
            "pack": [],
            "php_override": "",
            "p": null,
            "a": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "aids": null
        })
    });

}


