/**
 * Get Facebook Group Post Feedback ID
 * @returns Facebook Group Post Feedback ID
 */

function getFeedbackID() {

    const url = window.location.href;
    const regex = /#.*/gmi;
    let feedBackCommentID = "";
    let commentCount = 0;
    if (url.indexOf(window.location.href.replace(regex, '')) !== -1 && window.location.href.replace(regex, '').match(/(.*facebook.*\/permalink|.*facebook.*\/posts\/|.*facebook.*\/multi_permalinks)/gmi)) {

        console.log('Link Match 1')
        for (const s of document.querySelectorAll('script')) {
            if (s.textContent.match(/isFeedUnit":"Story/gmi)) {
                console.log('Story Unit Match');
                const json = JSON.parse(s.textContent);
                if (json) {
                    console.log('Access to JSON');
                    const list = json.require[0][3][0].__bbox.require;
                    const data = list.find(data => data[0] && data[0].match(/RelayPrefetchedStreamCache/gmi))
                    if (data) {
                        if (data[3][1].__bbox.result.data.node) { //most group and pages

                            const n = data[3][1].__bbox.result.data.node
                            const authors = n.comet_sections.content.story.actors
                            const reaction_count = n.comet_sections.feedback.story.feedback_context.feedback_target_with_context.ufi_renderer.feedback.comet_ufi_summary_and_actions_renderer.feedback.reaction_count?.count || 0;
                            const comment_count = n.comet_sections.feedback.story.feedback_context.feedback_target_with_context.ufi_renderer.feedback.comment_list_renderer.feedback.comment_count?.total_count || 0;

                            const feedback_id = data[3][1].__bbox.result.data.node.feedback.id;
                            feedBackCommentID = feedback_id;
                            commentCount = comment_count;

                        } else if (data[3][1].__bbox.result.data.page) {//some pages
                            const page = data[3][1].__bbox.result.data.page

                            const { timeline_feed_units } = page;
                            if (timeline_feed_units && timeline_feed_units.edges && timeline_feed_units.edges.length) {
                                const edge = timeline_feed_units.edges.find(edge => edge.node.comet_sections.content.story.wwwURL.indexOf(window.location.href) !== -1)
                                if (edge) {
                                    const feedback_id = edge.node.feedback.id;
                                    feedBackCommentID = feedback_id;

                                }

                            }
                        }

                    } else console.log("data not found", data)
                } else console.log('No Json Found');
            }
        }

    } else if (url.indexOf(window.location.href.replace(regex, '')) !== -1 && window.location.href.replace(regex, '').match(/.*facebook.*\/watch\/|.*facebook.*\/videos\//gmi)) {
        console.log('Link Match 2')
        let feedback_id = null;
        let title = null;
        let reaction_count = 0;
        let comment_count = 0;
        const authors = []
        for (const s of document.querySelectorAll('script')) {
            if (s.textContent.match(/RelayPrefetchedStreamCache/gmi)) {
                const json = JSON.parse(s.textContent);
                if (json) {

                    const list = json.require[0][3][0].__bbox.require;
                    const data = list.find(data => data[0] && data[0].match(/RelayPrefetchedStreamCache/gmi))

                    if (data[3][1].__bbox.result.data.feedback) {

                        const feedback = data[3][1].__bbox.result.data.feedback;
                        feedback_id = feedback.id;
                        if (feedback.title) title = feedback.title.text;
                        if (feedback.owner) authors.push(feedback.owner.id);
                        if (feedback.comment_list_renderer && !comment_count) comment_count = feedback.comment_list_renderer.feedback.comment_count.total_count;
                        if (feedback.comment_count && !comment_count) comment_count = feedback.comment_count.total_count;
                        if (feedback.reaction_count && !reaction_count) reaction_count = feedback.reaction_count.count;
                    } else if (data[3][1].__bbox.result.data.video_home_www_playlist) {
                        const { video_home_sections } = data[3][1].__bbox.result.data.video_home_www_playlist
                        if (video_home_sections.edges) {
                            for (const edge of video_home_sections.edges) {
                                const { node } = edge;
                                const { section_renderer } = node;
                                if (section_renderer) {
                                    const { section } = section_renderer;
                                    if (section) {
                                        const { section_components } = section;
                                        if (section_components && section_components.edges) {
                                            for (const e of section_components.edges) {
                                                for (const attachment of e.node.feed_unit.attachments) {
                                                    const { media } = attachment;
                                                    if (media && window.location.href.indexOf(media.id) !== -1) {
                                                        if (!feedback_id) feedback_id = media.feedback.id;
                                                        if (media.feedback.reaction_count && !reaction_count) reaction_count = media.feedback.reaction_count.count;
                                                        if (!comment_count) comment_count = parseInt(media.feedback.i18n_reaction_count.replace(/k/gmi, ''))
                                                        if ((media.feedback.i18n_reaction_count.match(/k/gmi))) comment_count *= 1000;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        feedBackCommentID = feedback_id;
        commentCount = comment_count;
    }
    return { feedback_id: feedBackCommentID, comments: commentCount };
}

/**
 * Get Facebook Group Numeric ID
 * @returns Facebook Group Numeric ID
 */
function getGroupID() {
    let group_id = "";
    document.querySelectorAll('script').forEach(s => {
        if (s.textContent.match(/RelayPrefetchedStreamCache/)) {
            const json = JSON.parse(s.textContent);
            const data = json.require[0][3][0].__bbox.require.find(data => data[0].match(/RelayPrefetchedStreamCache/gmi));
            if (data) {
                const res = data[3][1].__bbox.result.data;
                if (res.group) {
                    group_id = res.group.id;
                    console.log('Group ID', group_id)
                }
            }
        }
    });
    return group_id;
}


/**
* Uses the Facebook Graph API to create a comment under a post
*/
async function createComment(groupID, feedbackID, message, ranges = []) {

    try {
        const bson = JSON.parse(document.querySelector('#__eqmc').textContent);
        const hsi = bson.e;
        const fb_dtsg = bson.f;
        const list = bson.u.split("&");
        const fb_id = list[1].replace("__user=", "");
        const comet_req = list[2].replace("__comet_req=", "");
        const jazoest = list[3].replace("jazoest=", "");

        // Create random session ID
        const sessionID = crypto.randomUUID();
        const idempotence_token = crypto.randomUUID();
        const conversation_guide_session_id = crypto.randomUUID();


        const headers = {
            Accept: 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/x-www-form-urlencoded',//'text/javascript; charset=utf-8',//"multipart/form-data" //'application/json; charset=utf-8',
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-fb-friendly-name": 'CometUFICreateCommentMutation',
        };

        const formdata = new FormData();
        formdata.append('av', fb_id); //changable
        formdata.append('__user', fb_id); //changable
        formdata.append('__a', '1');
        formdata.append('__dyn', '7AzHJ16U9ob8ng5K8G6EjBWo2nDwAxu13w8CewSwMwNw9G2Saxa1NwJwpUe8hwaG0Z82_CxS320om78c87m221FwgolzUO0n2US2G5Usw9m1YwBgK7o884y0Mo4G4Ufo5m1mzXxG1Pxi4UaEW2G1jxS6FobrwKxm5o7G4-5pUfE98jwxwjFovUaU3VBwJCwLyES0Io88cA0z8c84qifxe3u362-2B0'); //changable
        formdata.append('__csr', 'gjiPNcbinvdvfEBY-gAOOsh5NshTPlt_bkkOPfiXYB99BPjuQDAlqGJdbAGHLWilJKHKGGl2FeUNep7ACiF4mcGnBCgrBZ5XAzVuqENeqq2SuaxqV9AUG2KGxeHzAu8ho88hxe5U98_AgKEcE-ubyrBwxxS5EaEzKdwNACwbOu2m0OawiUnwaC2O16w8Ku2a2G2-2u18wc20xA9wgE56265U07BW00xY85216wca0aMw0xIw0DKxW0g6m4Aew0_no0hSw0Few4Zw'); //changable
        formdata.append('__req', 's'); //changable
        formdata.append('__hs', '19242.HYP:comet_pkg.2.1.0.2.1');
        formdata.append('dpr', '1');
        formdata.append('__ccg', 'GOOD');
        formdata.append('__rev', '1006154635');
        formdata.append('__s', 'at3sfb:v1k4oa:upwmew'); //changable
        formdata.append('__hsi', hsi); //changable
        formdata.append('__comet_req', comet_req); //changable
        formdata.append('fb_dtsg', fb_dtsg); //changable
        formdata.append('jazoest', jazoest);
        formdata.append('lsd', 'az_0Egr_g1pKwzvxoHVQFZ');
        formdata.append('__spin_r', '1006154635');
        formdata.append('__spin_b', 'trunk');
        formdata.append('__spin_t', '1662536324');
        formdata.append('fb_api_caller_class', 'RelayModern');
        formdata.append('fb_api_req_friendly_name', 'CometUFICreateCommentMutation');//changable
        formdata.append('server_timestamps', true);


        formdata.append('variables', JSON.stringify({
            "displayCommentsFeedbackContext": null,
            "displayCommentsContextEnableComment": null,
            "displayCommentsContextIsAdPreview": null,
            "displayCommentsContextIsAggregatedShare": null,
            "displayCommentsContextIsStorySet": null,
            "feedLocation": "GROUP_PERMALINK",
            "feedbackSource": 2,
            "focusCommentID": null,
            "groupID": null,
            "includeNestedComments": false,
            "input": {
                "attachments": null,
                "feedback_id": feedbackID,
                "formatting_style": null,
                "message": {
                    "ranges": [],
                    "text": message
                },
                "attribution_id_v2": "CometGroupPermalinkRoot.react,comet.group.permalink,via_cold_start,1696582989139,674454,2361831622,",
                "feedback_referrer": `/groups/${groupID}`,
                "is_tracking_encrypted": true,
                "tracking": [
                    "AZXRQztA9O9v-FtuIgYTkBZKoweGBkXC7aGxjuxbUoA8Dopq8JS9ZVp1xx7KbnC6acMhvq3mMfPogACIvhw6tOn46dP4P24PJPR_SEVmr9gtAah-_VGLaTi6850BRsDu47sGww6bkNjHVMMc2UrZD4JdsFKp8Vf2g7H3iQ_CSj-76yujnJeGYrD5JZRXrDmJsBg5Zz57e7zZduenIVqya-d8usPPEOdi4oTcg6Xzkh-rJ_RDgFuH2KLE36v_SLf-q3mFBe9949UnLDMfrbxbEqEzHkdCykyIK2YqmPFbZxzHChsNyzTkTT2qQtxZisYL-tALsSH1tYrV_OXV4yOUd6rnlo66zNhQ4ypi3NVR6lhUrSorbLrq-l_QEor0KLHaEH4K7cP8K4KIL7DyYGx7kQeLCfk45ytTOw9ME8dPz0oo_aWobm6Skt2Z8Tm8EnfhLK30WKbegsI2i1h4knlSPJPaTPhnZ-tRlisPSYdqmtpqs_zGlx_3VtGNaHv2_-CB8f6G7YE9Zi1jPlRc8OQvXFpsU0hSHQ8z6lnIf9bc0aRW1pntRHAwMKA8wDsr6DQibJ-_elg2hph_GhZaNFoU7UVbPZNZW9PzmMdaY4U2eY76F8R7iWsVkYkEHMaHf8gMWKH1SkCdBiyn1aaFaQU3WzxDgRrdkm56B79yCHfsxqgj0Ok8jNH8CgvK1p0SrERQ-00ytC1mDsfZ3T1tUlSrWVGDlXDlzHe6C4OvmIyU8ErhJNxtMGt_uRTJ33hBF-WpqSqezO3djyJS5BPMi5IJpxhg",
                    JSON.stringify({
                        "assistant_caller": "comet_above_composer",
                        "conversation_guide_session_id": conversation_guide_session_id,
                        "conversation_guide_shown": null
                    })
                ],
                "feedback_source": "OBJECT",
                "idempotence_token": `client:${idempotence_token}`,
                "session_id": sessionID,
                "actor_id": fb_id,
                "client_mutation_id": "7"
            },
            "inviteShortLinkKey": null,
            "renderLocation": null,
            "scale": 1,
            "useDefaultActor": false,
            "UFI2CommentsProvider_commentsKey": "CometGroupPermalinkRootFeedQuery"
        })); //changable
        formdata.append('doc_id', '23961721413472742'); //changable


        const body = new URLSearchParams(formdata);
        const res = await fetch('https://web.facebook.com/api/graphql/', { method: "POST", body: body, headers: headers, "mode": "cors", "credentials": "include", "referrer": window.location.href })
        const json = await res.json();
        console.log(json);
    } catch (e) {
        console.log(e);
    }
}


/**
* Uses the Facebook Graph API to create a reply under a comment
*/
async function replyToComment(groupID, feedbackID, message, ranges = []) {

    try {
        const bson = JSON.parse(document.querySelector('#__eqmc').textContent);
        const hsi = bson.e;
        const fb_dtsg = bson.f;
        const list = bson.u.split("&");
        const fb_id = list[1].replace("__user=", "");
        const comet_req = list[2].replace("__comet_req=", "");
        const jazoest = list[3].replace("jazoest=", "");

        // Create random session ID
        const sessionID = crypto.randomUUID();
        const idempotence_token = crypto.randomUUID();
        // const conversation_guide_session_id = crypto.randomUUID();


        const headers = {
            Accept: 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/x-www-form-urlencoded',//'text/javascript; charset=utf-8',//"multipart/form-data" //'application/json; charset=utf-8',
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-fb-friendly-name": 'CometUFICreateCommentMutation',
        };

        const formdata = new FormData();
        formdata.append('av', fb_id); //changable
        formdata.append('__user', fb_id); //changable
        formdata.append('__a', '1');
        formdata.append('__dyn', '7AzHJ16U9ob8ng5K8G6EjBWo2nDwAxu13w8CewSwMwNw9G2Saxa1NwJwpUe8hwaG0Z82_CxS320om78c87m221FwgolzUO0n2US2G5Usw9m1YwBgK7o884y0Mo4G4Ufo5m1mzXxG1Pxi4UaEW2G1jxS6FobrwKxm5o7G4-5pUfE98jwxwjFovUaU3VBwJCwLyES0Io88cA0z8c84qifxe3u362-2B0'); //changable
        formdata.append('__csr', 'gjiPNcbinvdvfEBY-gAOOsh5NshTPlt_bkkOPfiXYB99BPjuQDAlqGJdbAGHLWilJKHKGGl2FeUNep7ACiF4mcGnBCgrBZ5XAzVuqENeqq2SuaxqV9AUG2KGxeHzAu8ho88hxe5U98_AgKEcE-ubyrBwxxS5EaEzKdwNACwbOu2m0OawiUnwaC2O16w8Ku2a2G2-2u18wc20xA9wgE56265U07BW00xY85216wca0aMw0xIw0DKxW0g6m4Aew0_no0hSw0Few4Zw'); //changable
        formdata.append('__req', 's'); //changable
        formdata.append('__hs', '19242.HYP:comet_pkg.2.1.0.2.1');
        formdata.append('dpr', '1');
        formdata.append('__ccg', 'GOOD');
        formdata.append('__rev', '1006154635');
        formdata.append('__s', 'at3sfb:v1k4oa:upwmew'); //changable
        formdata.append('__hsi', hsi); //changable
        formdata.append('__comet_req', comet_req); //changable
        formdata.append('fb_dtsg', fb_dtsg); //changable
        formdata.append('jazoest', jazoest);
        formdata.append('lsd', 'az_0Egr_g1pKwzvxoHVQFZ');
        formdata.append('__spin_r', '1006154635');
        formdata.append('__spin_b', 'trunk');
        formdata.append('__spin_t', '1662536324');
        formdata.append('fb_api_caller_class', 'RelayModern');
        formdata.append('fb_api_req_friendly_name', 'CometUFICreateCommentMutation');//changable
        formdata.append('server_timestamps', true);


        formdata.append('variables', JSON.stringify({
            "displayCommentsFeedbackContext": null,
            "displayCommentsContextEnableComment": null,
            "displayCommentsContextIsAdPreview": null,
            "displayCommentsContextIsAggregatedShare": null,
            "displayCommentsContextIsStorySet": null,
            "feedLocation": "GROUP_PERMALINK",
            "feedbackSource": 2,
            "focusCommentID": null,
            "groupID": null,
            "includeNestedComments": false,
            "input": {
                "attachments": null,
                "feedback_id": feedbackID,
                "formatting_style": null,
                "message": {
                    "ranges": [],
                    "text": message
                },
                "reply_target_clicked": true,
                "attribution_id_v2": "CometGroupPermalinkRoot.react,comet.group.permalink,via_cold_start,1696586475440,117606,2361831622,",
                "feedback_referrer": `/groups/${groupID}`,
                "is_tracking_encrypted": false,
                "tracking": [null],
                "feedback_source": "OBJECT",
                "idempotence_token": `client:${idempotence_token}`,
                "session_id": sessionID,
                "actor_id": fb_id,
                "client_mutation_id": "8"
            }, "inviteShortLinkKey": null,
            "renderLocation": null, "scale": 1,
            "useDefaultActor": false,
            "UFI2CommentsProvider_commentsKey": "CometGroupPermalinkRootFeedQuery"
        })); //changable
        formdata.append('doc_id', '23961721413472742'); //changable


        const body = new URLSearchParams(formdata);
        const res = await fetch('https://web.facebook.com/api/graphql/', { method: "POST", body: body, headers: headers, "mode": "cors", "credentials": "include", "referrer": window.location.href })
        const json = await res.json();
        console.log(json);
    } catch (e) {
        console.log(e);
    }
}