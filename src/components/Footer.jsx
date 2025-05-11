/*global chrome*/
import { useState } from 'react'
import ToggleButton from 'react-toggle-button'
import { BiHelpCircle } from "react-icons/bi";
import { FaFileCsv } from 'react-icons/fa';
import { FaHandsHelping, FaShareAlt } from "react-icons/fa";
import ToolTip from './ToolTip';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import swal from 'sweetalert';
import { mkConfig, generateCsv, download } from "export-to-csv";

function Footer() {

    const [active, setActive] = useState(false);

    useEffect(() => chrome.storage.sync.get('active', data => setActive(data.active ? data.active : false)), [])

    const onToggle = () => chrome.storage.sync.set({ active: !active }, () => setActive(!active));

    const onWebsite = (route) => chrome.tabs.create({ url: `https://stickynotespro.vercel.app/${route}` });

    const onUrl = (url) => chrome.tabs.create({ url });



    const onCSV = async () => {
        const { notes } = await chrome.storage.sync.get('notes');
        if (!notes || !notes.length) return swal('Download CSV', 'There are not notes', 'warning');

        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: false,
            showTitle: false,
            title: `Sticky Notes Pro`,
            filename: `Sticky Notes Pro`,
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
        };

        // mkConfig merges your options with the defaults
        // and returns WithDefaults<ConfigOptions>
        const csvExporter = mkConfig(options);

        // Converts your Array<Object> to a CsvOutput string based on the configs
        const csv = generateCsv(csvExporter)(notes.sort((a, b) => a.webname - b.webname));


        download(csvExporter)(csv)
        swal('Export CSV', 'CSV download successfully. Check your download folder', 'success');
    }




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
                <ToolTip text="Share Sticky Notes Pro">
                    <Link to="/share">
                        <FaShareAlt size={20} className="svg" />
                    </Link>
                </ToolTip>

                <ToolTip text="Support Desk">
                    <Link to="/#" onClick={() => onUrl('https://support.m2kdevelopments.com')}>
                        <FaHandsHelping size={20} className="svg" />
                    </Link>
                </ToolTip>


                <ToolTip text="Download CSV">
                    <FaFileCsv onClick={onCSV} size={20} class="svg" />
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