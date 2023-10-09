/*global chrome*/
import React, { useState } from 'react'
import ToggleButton from 'react-toggle-button'
import { BiHelpCircle } from "react-icons/bi";
import { AiFillChrome } from "react-icons/ai";
import { FaHandsHelping, FaShareAlt } from "react-icons/fa";
import ToolTip from './ToolTip';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';


function Footer() {

    const [active, setActive] = useState(false);

    useEffect(() => chrome.storage.local.get('active', data => setActive(data.active ? data.active : false)), [])

    const onToggle = () => chrome.storage.local.set({ active: !active }, () => setActive(!active));
 
    const onWebsite = (route, type = "panel") => chrome.windows.create({ url: `https://m2kdevelopments.com/getgame${route}?utm_source=chrome&utm_medium=extension&utm_campaign=promo`, type });

    return (
        <div className='footer'>
            <ToggleButton
                value={active}
                onToggle={onToggle}
                colors={{
                    activeThumb: {
                        base: 'rgb(250,250,250)',
                    },
                    active: {
                        base: 'rgb(28 133 241)',
                        hover: 'rgb(177, 191, 215)',
                    }
                }}
            />
            <div className='footer-actions'>
                <ToolTip text="Share Get Game">
                    <Link to="/share">
                        <FaShareAlt size={20} className="svg" />
                    </Link>
                </ToolTip>

                <ToolTip text="Support">
                    <Link to="/#" onClick={() => onWebsite('/support')}>
                        <FaHandsHelping size={20} className="svg" />
                    </Link>
                </ToolTip>

                <ToolTip text="Check for Updates">
                    <Link to="/#" onClick={() => onWebsite('/extension/updates')}>
                        <AiFillChrome size={20} className="svg" />
                    </Link>
                </ToolTip> 

                <ToolTip text="Learn How to Use">
                    <Link to="/#" onClick={() => onWebsite('/extension/help')}>
                        <BiHelpCircle size={20} className="svg" />
                    </Link>
                </ToolTip>
            </div>
        </div>
    )
}

export default Footer