import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ActionIcon, Badge, MantineProvider, Stack, Switch, TextInput, Tooltip } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useState } from 'react';
import swal from 'sweetalert';
import { BiCopy, BiSearch } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';
import { FaGithub, FaPaypal } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';

interface INote {
	webname: string,
	url: string,
	id: number,
	name: string,
	text: string,
}

const App = () => {

	const [notes, setNotes] = useState<INote[]>([]);
	const [urlNoteMap, setUrlNoteMap] = useState(new Map());
	const [search, setSearch] = useState("");
	const [active, setActive] = useState(false);

	// toggle activity
	useEffect(() => chrome.storage.sync.get('active', (data: any) => setActive(data.active ? data.active : false)), []);
	useEffect(() => {
		chrome.storage.sync.set({ active: active });
	}, [active]);

	// Get chrome notes
	useEffect(() => {
		chrome.storage.sync.get('notes', async (data: any) => {
			const { notes } = data;
			if (notes) setNotes(notes);
		});

	}, []);

	// Auto update notes
	useEffect(() => {
		const map = new Map();
		for (const note of notes) {
			const { url } = note;
			if (map.get(url)) map.set(url, [...map.get(url), note]);
			else map.set(url, [note]);
		}
		setUrlNoteMap(map);
	}, [notes]);

	const onToggle = () => chrome.storage.local.set({ active: !active }, () => setActive(!active));

	const filter = useCallback((notes: any[]) => {
		if (search.replace(/\s/gmi, '') === '') return true;
		if (notes[0].webname.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
		for (const note of notes) {
			if (note.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
			if (note.text.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
		}
	}, [search])

	const onCopy = (note: string) => window.navigator.clipboard.writeText(note).then(() =>
		notifications.show({
			title: 'Copied Page Link',
			message: note,
		}));

	const onDel = async (url: string) => {

		const result = await swal({
			title: "Delete Notes",
			text: `Are you sure you want to delete all the notes from this url`,
			icon: "info",
			buttons: ['NO', 'YES']
		});


		if (result) {
			const newNotes = notes.filter(note => note.url !== url);
			chrome.storage.sync.set({ notes: newNotes }, () => setNotes(newNotes));
			notifications.show({
				title: 'Deleted Notes',
				message: "Deleted All Notes"
			})
		}
	}

	const onRename = async (url: string) => {
		const note = notes.find(note => note.url === url);
		const name = await swal({
			title: "Rename Notes",
			text: `Are you sure you want to rename this list?`,
			icon: "info",
			content: {
				element: 'input',
				attributes: {
					defaultValue: note?.webname,
				}
			},
			buttons: ['NO', 'YES']
		});


		if (name) {

			// Rename List
			const ids = [];
			for (const index in notes) {
				const note = notes[index];
				if (note.url === url) {
					ids.push(note.id);
					notes[index].webname = name;
				}
			}
			chrome.storage.sync.set({ notes: notes }, () => setNotes([...notes]));
			swal("Note Rename");

		}
	}




	return (
		<MantineProvider>
			<Notifications />
			<main className="w-screen h-screen overflow-hidden">
				<nav className='w-full h-20 from-purple-700 to-pink-700 bg-gradient-to-r gap-3 pl-4 flex items-center justify-center shadow-xl'>
					<div>
						<img src={chrome.runtime.getURL("logo192.png")} width={40} height={40} />
					</div>
					<span className='text-2xl font-bold text-white'>Stycki</span>
					<div className='w-full flex justify-end pr-4 gap-4'>

						<Switch checked={active} onChange={() => onToggle()} size="lg" color='grape' onLabel="ON" offLabel="OFF" />

						<Tooltip label="Check out Github">
							<ActionIcon color='grape' onClick={() => chrome.tabs.create({ url: "https://github.com/M2kDevelopments/Stycki" })}>
								<FaGithub />
							</ActionIcon>
						</Tooltip>

						<Tooltip label="Donate with Paypal">
							<ActionIcon color='white' onClick={() => chrome.tabs.create({ url: "https://www.paypal.com/paypalme/m2kdevelopment" })}>
								<FaPaypal color='#003087' />
							</ActionIcon>
						</Tooltip>

						<Tooltip label="Buy me a coffee">
							<ActionIcon color='orange' onClick={() => chrome.tabs.create({ url: "https://buymeacoffee.com/m2kdevelopments" })}>
								<SiBuymeacoffee />
							</ActionIcon>
						</Tooltip>
					</div>
				</nav>

				<div className='mx-4 my-2'>
					<TextInput
						className="w-full p-2"
						leftSection={<BiSearch />}
						placeholder="Search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className='mx-4 my-2 p-2 rounded-lg shadow-xl bg-gray-100 h-[calc(100%-6rem)] overflow-y-auto'>
					{
						Array
							.from(urlNoteMap.values())
							.sort((a: INote[], b: INote[]) => a[0].webname.localeCompare(b[0].webname))
							.filter(filter)
							.map((notes: INote[]) => (
								<Stack key={notes[0].id}>
									<div className='flex gap-1 items-center'>
										<Badge color='grape'>
											{notes.length}
										</Badge>
										<div className='flex flex-col pl-1 w-full'>
											<span className='font-bold line-clamp-1'>{notes[0].webname}</span>
											<span onClick={() => chrome.tabs.create({ url: notes[0].url })} className='font-thin text-xs line-clamp-1 cursor-pointer hover:text-amber-600 hover:font-bold duration-200'>{notes[0].url}</span>
										</div>
										<div className='flex gap-3 justify-end'>

											<Tooltip label="Copy web url">
												<ActionIcon color='lightgray'
													onClick={() => onCopy(notes[0].url)}
												>
													<BiCopy color="purple" />
												</ActionIcon>
											</Tooltip>

											<Tooltip label="Rename web url">
												<ActionIcon color='lightgray'
													onClick={() => onRename(notes[0]?.url)}
												>
													<FiEdit color="purple" />
												</ActionIcon>
											</Tooltip>

											<Tooltip label="Delete">
												<ActionIcon color='black'
													onClick={() => onDel(notes[0].url)}
												>
													<AiFillDelete color='white' />
												</ActionIcon>
											</Tooltip>
										</div>
									</div>
								</Stack>
							))
					}
				</div>
			</main>
		</MantineProvider>
	);
}

export default App;
