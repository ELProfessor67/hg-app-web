import { useSocketUser } from './hooks'
import { useRef } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import { FaPlay, FaPause } from 'react-icons/fa';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Dialog from './components/Dialog';
import NewDialog from './components/NewDialog';
import { CiSquareQuestion } from 'react-icons/ci'
import ChatBox from './components/ChatBox';
import Message from './components/Message';
import { MdCall } from "react-icons/md";
import CallComponents from './components/CallComponents';
import { FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { REACT_PUBLIC_RADIO_URL, REACT_PUBLIC_SOCKET_URL } from './constants';
import { IoPlayBack, IoPlayOutline } from "react-icons/io5";
import { IoPauseOutline } from "react-icons/io5";
import { BsSkipForward, BsSkipBackward } from "react-icons/bs";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ReactCurvedText from "react-curved-text";
import { IoCalendarNumber } from "react-icons/io5";
import { BiMessage, BiVolume, BiVolumeLow } from 'react-icons/bi';
import { PiPauseCircle, PiPhone, PiPlayCircle } from 'react-icons/pi';
import { CgPlayForwards } from 'react-icons/cg';

const sleep = ms => new Promise(r => window.setTimeout(r, ms));
function groupDJsByDays(djsData) {
	const daysDict = {
		0: [],
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: []
	};

	djsData.forEach(dj => {
		dj.djDays.forEach(day => {
			daysDict[day].push(dj);
		});
	});

	return daysDict;
}


function getNextDJ(djs) {
	const now = new Date();
	const currentUTCDay = now.getUTCDay();
	const currentUTCHours = now.getUTCHours();
	const currentUTCMinutes = now.getUTCMinutes();
	const currentUTCTimeInMinutes = currentUTCHours * 60 + currentUTCMinutes; // Convert current UTC time to minutes since midnight

	let nextDJ = null;
	let minTimeDiff = Infinity;

	djs.forEach(dj => {
		// Check if DJ is active on the current UTC day
		if (dj.djDays.includes(String(currentUTCDay))) {
			const [startHours, startMinutes] = dj.djStartTime?.split(':').map(Number);
			const startTimeInMinutes = startHours * 60 + startMinutes;
			let timeDiff = startTimeInMinutes - currentUTCTimeInMinutes;

			if (timeDiff < 0) {
				timeDiff += 24 * 60; // Adjust for next day if the DJ's start time has already passed today
			}

			// Check if this DJ has the smallest time difference and update nextDJ accordingly
			if (timeDiff < minTimeDiff) {
				minTimeDiff = timeDiff;
				nextDJ = dj;
			}
		}
	});

	return nextDJ;
}


function convertUTCToLocal(utcTime, utcDate = new Date()) {
	// Split the UTC time into hours and minutes
	if (!utcTime) return
	const [utcHours, utcMinutes] = utcTime.split(':').map(Number);

	// Create a Date object using the provided UTC time and date
	const utcDateTime = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), utcHours, utcMinutes));

	// Get the local time equivalent
	const localDateTime = new Date(utcDateTime);

	// Extract the local hours and minutes
	const localHours = localDateTime.getHours();
	const localMinutes = localDateTime.getMinutes();

	// Format the local time as a string in HH:MM format
	const localTime = `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}`;

	return localTime;
}

function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}


const Timer = ({ timerStart }) => {
	const [straimgTime, setStraimgTime] = useState('00:00:00');
	const interValref = useRef();
	const [second, setSecond] = useState(0);


	const startTime = () => {
		interValref.current = setInterval(() => {
			setSecond(prev => prev + 1);
		}, 1000);

	}

	useEffect(() => {
		let hour = Math.floor(second / 3600);
		let min = Math.floor((second % 3600) / 60);
		let sec = Math.floor((second % 3600) % 60);

		// console.log(second)

		if (hour < 10) hour = `0${hour}`;
		if (min < 10) min = `0${min}`;
		if (sec < 10) sec = `0${sec}`;

		// console.log(`${hour}:${min}:${sec}`)
		setStraimgTime(`${hour}:${min}:${sec}`);
	}, [second]);

	const stopTime = () => {
		clearInterval(interValref.current);
	}

	useEffect(() => {
		console.log(timerStart);
		if (timerStart) {
			startTime();
		} else {
			stopTime();
		}
	}, [timerStart])
	return <span>{straimgTime}</span>
}

// const query = new URLSearchParams(window.location.search);
// const params = {
//   streamId: query.get("id")
// }
const params = {
	streamId: "655347b59c00a7409d9181c3"
}


export default function App() {
	const [user, setUser] = useState(null);
	const [schediles, setSchedules] = useState([]);
	const [songs, setSongs] = useState([]);
	const [isPlay, setIsPlay] = useState(false);
	const [message, setMessage] = useState('');
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [gedetailOpen, setGetDetailsOpne] = useState(false);
	const [callOpen, setCallOpen] = useState(false);
	const [permissionReset, setPermissionReset] = useState(false);
	// null,processing,accepted,rejected
	const [callStatus, setCallStatus] = useState(null);
	// const [soundOff,setSoundOff] = useState(false);
	const [volume, setVolume] = useState(1);
	const [record, setRecord] = useState(false);
	const [chatOpen, setChatOpen] = useState(false);
	const [scheduleOpen, setScheduleOpen] = useState(false);
	const [djs, setDjs] = useState({});
	const [nextDJ, setNextDJ] = useState([]);
	const audioRef = useRef(null);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const downloadLink = useRef();

	// console.log('isPlay from components side', isPlay)
	const { roomActive, handleRequestSong, isLive, autodj, messageList, handleSendMessage, callAdmin, cutCall, nextSong, currentSong } = useSocketUser(params.streamId, audioRef, name, isPlay, setIsPlay, message, setMessage, setCallStatus, location);
	// const [more,setMore] = useState(false);
	const [rOpen, setROPen] = useState(false);
	console.log(roomActive)

	const handlePlay = () => {
		console.log(audioRef.current.src)
		if (isPlay) {
			audioRef.current.pause();
			setIsPlay(false);
		} else {
			audioRef.current.play();
			setIsPlay(true);
		}
	}


	useEffect(() => {
		audioRef.current.volume = volume;
	}, [volume]);


	useEffect(() => {
		if (!roomActive) {
			setIsPlay(false);
			audioRef.current.pause();
		}
	}, [roomActive])


	useEffect(() => {
		(async function () {
			try {
				const { data } = await axios.get(`${REACT_PUBLIC_SOCKET_URL}/api/v1/channel-detail/${params.streamId}`);
				setUser(data?.user);
				setSongs(data?.songs);
				setSchedules(data?.schedules);
			} catch (err) {
				console.log(err?.response?.data?.message);
			}
		})();
	}, []);


	function startRecording() {
		const audioStream = audioRef.current.captureStream();

		// Create a MediaRecorder instance
		mediaRecorder.current = new MediaRecorder(audioStream);

		// Listen for data available event
		mediaRecorder.current.ondataavailable = (event) => {
			if (event.data.size > 0) {
				recordedChunks.current.push(event.data);
			}
		};

		// Listen for the recording stop event
		mediaRecorder.current.onstop = () => {
			const blob = new Blob(recordedChunks.current, { type: 'audio/wav' });
			const url = URL.createObjectURL(blob);
			downloadLink.current.href = url;
			downloadLink.current.download = 'live_session.wav';
			downloadLink.current.click();
		};

		// Start recording
		mediaRecorder.current.start();
	}

	function stopRecording() {
		// Stop recording
		mediaRecorder.current.stop();
	}

	const handleRecord = () => {
		if (record) {
			setRecord(false);
			stopRecording();
		} else {
			setRecord(true);
			startRecording();
		}
	}

	const handleCall = async () => {
		window.open(`https://hgdjlive.com/call/${params.streamId}`)
	}



	useEffect(() => {
		const element = document.getElementById('navbar');
		if (element) {
			element.style.background = 'transparent';
		}
	}, [])



	useEffect(() => {
		fetch(`${REACT_PUBLIC_SOCKET_URL}/api/v1/all-djs`,).then(res => res.json()).then(res => {
			if (res.teams) {

				setDjs(groupDJsByDays(res.teams));
				setNextDJ(getNextDJ(res.teams));
			}
		}).catch(err => console.log(err.message))
	}, [])


	const handleEnded = async (isPlay) => {
		console.log('handle handleEnded call');
		if (true) {
			console.log('handle playing... call');
			const url = audioRef.current.src
			audioRef.current.src = url;
			await sleep(3000)
			audioRef.current.play();
		}

	}



	return (
		<>

			<div className='w-screen h-screen bg-[#1f2226] relative pt-4 flex flex-col'>
				<audio ref={audioRef} controls className="w-full bg-none hidden" onEnded={() => handleEnded(isPlay)}></audio>
				<div className='flex items-center justify-center'>
					<img src={'/logo.png'} className={`w-[12rem] rounded-xl object-cover mb-10`} />
				</div>

				<div className={`  px-5`}>

					<div className={`flex justify-center items-center flex-col px-4`}>
						<h2 className={`text-white  text-center text-lg mb-7`}>{isLive ? "🛜 Live" : "🤖 Auto DJ"}</h2>
						<h2 className={`text-white text-2xl font-bold text-center`}>{currentSong?.title?.split('.')[0]}</h2>
						<h2 className={`text-white mt-3`}>Artist: Jon Harris ,  Album: Jon Harris</h2>
						<h2 className={`text-white mt-3`}>Next song : About Us</h2>
						<div className={`flex justify-center items-center mt-8 flex-row w-full `}>
							<button className="text-gray-300 mr-3" onClick={() => volume === 0 ? setVolume(0.5) : setVolume(0)}>
								{
									volume === 0 ? <HiSpeakerXMark size={22} /> : <HiSpeakerWave size={22} />
								}
							</button>

							<input type="range" className="w-[90%]" min={0} max={1} step={0.1} value={volume} onChange={(e) => setVolume(e.target.value)} />


						</div>

						<div className={`flex justify-center  items-center mt-1 flex-row gap-8 w-full`}>
							<button disabled={!isLive} title="Call" className='disabled:opacity-20' onClick={handleCall}>
								<PiPhone size={30} color='white' className={`mr-1`} />
							</button>
							<button className="disabled:opacity-20 p-2 rounded-full border-none outline-none text-white text-2xl" disabled={!roomActive} onClick={handlePlay}>
								{
									isPlay ? <PiPauseCircle size={60} /> : <PiPlayCircle size={60} />
								}
							</button>
							<button disabled={!isLive} title="live chat" onClick={() => setChatOpen(true)} className='disabled:opacity-20'>
								<BiMessage size={30} color='white' className={`mr-1`} />
							</button>
						</div>
					</div>
				</div>


				<div className={`p-5 flex-1`}>
					<img src='/banner.jpg' className={`h-full w-full rounded-xl object-contain`} />
				</div>

				<ChatBox open={chatOpen} onClose={() => setChatOpen(false)} name={name} setName={setName} message={message} setMessage={setMessage} handleSendMessage={handleSendMessage}>
					{
						messageList.map(data => <Message {...data} />)
					}
				</ChatBox>
			</div>
		</>

	);
}