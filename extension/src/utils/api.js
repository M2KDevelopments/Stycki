/* eslint-disable no-undef */
import axios from "axios";
const instance = axios.create();
const authUrl = 'https://stickynotespro.vercel.app'; //Get Urls for APIs

export const URL = 'https://stickynotespro.vercel.app';
export const GetAPI = (route, auth = true) => Get(`${authUrl}${route}`, auth);
export const PostAPI = (route, body = {}, auth = true) => Post(`${authUrl}${route}`, body, auth);
export const PatchAPI = (route, body = {}, auth = true) => Patch(`${authUrl}${route}`, body, auth);
export const PutAPI = (route, body = {}, auth = true) => Put(`${authUrl}${route}`, body, auth);
export const DeleteAPI = (route, auth = true) => Delete(`${authUrl}${route}`, auth);

export function Get(url, auth = true) {
    return new Promise(async (resolve, reject) => {

        const chromeNotificationID = await getNotifacitonID();

        if (auth) {
            // Refresh user if necessary
            const token = await getAccessToken();

            const headers = {
                'Authorization': 'Bearer ' + token,
                'chromeNotificationID': chromeNotificationID,
            };

            try {
                const response = await instance.get(url, { headers });
                resolve(response.data);
            } catch (e) {
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                } else reject(e);

            }
        } else {
            try {

                const headers = { 'chromeNotificationID': chromeNotificationID, };
                const response = await instance.get(url, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                } else reject(e);

            }
        }
    });
}

export function Post(url, body = {}, auth = true) {
    return new Promise(async resolve => {


        const chromeNotificationID = await getNotifacitonID();


        if (auth) {

            //refresh user if necessary
            const token = await getAccessToken();

            const headers = {
                'Authorization': 'Bearer ' + token,
                'chromeNotificationID': chromeNotificationID,

            };

            try {
                const response = await instance.post(url, body, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                } else resolve({ result: false, message: "Network Problems. Check your internet" })
            }

        } else {
            try {

                const headers = { 'chromeNotificationID': chromeNotificationID, };
                const response = await instance.post(url, body, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                } else resolve({ result: false, message: "Network Problems. Check your internet" })
            }
        }
    });
}

export function Patch(url, body = {}, auth = true) {
    return new Promise(async resolve => {


        const chromeNotificationID = await getNotifacitonID();


        if (auth) {

            //refresh user if necessary
            const token = await getAccessToken();

            const headers = {
                'Authorization': 'Bearer ' + token,

                'chromeNotificationID': chromeNotificationID,

            };
            try {

                const response = await instance.patch(url, body, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                }
            }

        } else {
            try {

                const headers = { 'bosnotification': chromeNotificationID };
                const response = await instance.patch(url, body, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                }
            }

        }
    });
}


export function Put(url, body = {}, auth = true) {
    return new Promise(async resolve => {


        const chromeNotificationID = await getNotifacitonID();


        if (auth) {

            //refresh user if necessary
            const token = await getAccessToken();

            const headers = {
                'Authorization': 'Bearer ' + token,

                'chromeNotificationID': chromeNotificationID,

            };
            try {

                const response = await instance.put(url, body, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                }
            }

        } else {
            try {

                const headers = { 'bosnotification': chromeNotificationID };
                const response = await instance.put(url, body, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                }
            }

        }
    });
}


export function Delete(url, auth = true) {
    return new Promise(async resolve => {

        const chromeNotificationID = await getNotifacitonID();


        if (auth) {

            //refresh user if necessary
            const token = await getAccessToken();
            const headers = {
                'Authorization': 'Bearer ' + token,

                'chromeNotificationID': chromeNotificationID,

            };
            try {
                const response = await instance.delete(url, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                }
            }

        } else {
            try {

                const headers = { 'chromeNotificationID': chromeNotificationID, 'boschrome': chrome };
                const response = await instance.delete(url, { headers });
                resolve(response.data);
            } catch (e) {
                console.log(e);
                if (e.response) {
                    if (e.response.status < 500) {
                        resolve(e.response.data);
                    } else {
                        resolve({ result: false, message: "Something Went Wrong" })
                    }
                }

            }
        }
    });
}

export function getAccessToken() {
    return new Promise(resolve => chrome.storage.local.get('user', (data) => resolve(data?.user || "")));
}

function getNotifacitonID() {
    return new Promise(resolve => {
        chrome.storage.local.get('notificationId', async (data) => {
            resolve(data?.notificationId || "");
        })
    })
}