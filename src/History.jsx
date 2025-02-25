"use client";
import { useSocketUser } from './hooks'
import { useRef } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import { FaPlay, FaPause } from 'react-icons/fa';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Dialog from './components/Dialog';
import { CiSquareQuestion } from 'react-icons/ci'
import ChatBox from './components/ChatBox';
import Message from './components/Message';
import { MdCall } from "react-icons/md";
import CallComponents from './components/CallComponents';
import { FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { REACT_PUBLIC_RADIO_URL, REACT_PUBLIC_SOCKET_URL } from './constants';
import { IoPlayOutline } from "react-icons/io5";
import { IoPauseOutline } from "react-icons/io5";
import { BsSkipForward, BsSkipBackward } from "react-icons/bs";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ReactCurvedText from "react-curved-text";


// const query = new URLSearchParams(window.location.search);
// const params = {
//   streamId: query.get("id")
// }
const params = {
	streamId: "655347b59c00a7409d9181c3"
}


export default function History() {
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
	const audioRef = useRef(null);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const downloadLink = useRef();
	const [history,setHistory] = useState([]);

	// console.log('isPlay from components side', isPlay)
	const { roomActive, handleRequestSong, isLive, autodj, messageList, handleSendMessage, callAdmin, cutCall, nextSong, currentSong } = useSocketUser(params.streamId, audioRef, name, isPlay, setIsPlay, message, setMessage, setCallStatus, location);
	// const [more,setMore] = useState(false);
	const [rOpen, setROPen] = useState(false);
	console.log(roomActive)

	const handlePlay = () => {
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
		window.open(`https://onlinebazaarr.com/call/${params.streamId}`)
	}


	useEffect(() => {
		const element = document.getElementById('navbar');
		if(element){
		  element.style.background = '#07112696';
		}
	  },[])



	useEffect(() => {

		const history = JSON.parse(localStorage.getItem('songHistory') || '[]');
		setHistory(history);
	},[currentSong])






	return (
		<>
			<main className="site-body">
			<audio ref={audioRef} controls className="w-full bg-none hidden"></audio>
				{/* page banner start */}
				<section
					className="inner-page-banner overflow-hidden "
					style={{
						backgroundImage: 'url("assets/images/bg/inner-page-banner.jpg")'
					}}
				>
					<div className="container">
						<div className="row">
							<div className="col-lg-12">
								<div className="single-content">
									<h2>Play List</h2>
									<p className="text-white">Home / Play List</p>
								</div>
							</div>
						</div>
					</div>
					<section className="bg-slider ">
						<div className="circle xxlarge shade1" />
						<div className="circle xlarge shade2" />
						<div className="circle large shade3" />
						<div className="circle mediun shade4" />
						<div className="circle small shade5" />
					</section>
				</section>
				{/* page banner end */}
				<section className="pt-120 pb-120">
					<div className="container">
						<div className="row justify-content-center"></div>
						{/* row end */}
						<div className="row gy-5 justify-content-center">
							<div className="col-md-6 col-sm-6">
								<div
									className="show-item link-item"
									style={{ borderRadius: 10, cursor: "auto" }}
								>
									<img src="assets/images/shows/previous/2.jpg" alt="image" />
									<div className="show-item-content">
										<div
											className="section-top col-sm-10 "
											style={{
												justifyContent: "end",
												width: "100%",
												textAlign: "end",
												alignItems: "end",
												margin: "top -20px"
											}}
										>
											<span
												className="top-title"
												style={{ marginBottom: "3rem", marginLeft: 12 }}
											>
												Now Playing
											</span>
											<h2 className="section-title"> </h2>
										</div>
										<div
											className="artist-content"
											style={{
												paddingLeft: "0% !important",
												paddingRight: "0% !important",
												width: "100%"
											}}
										>
											<h5 className="show-name">{currentSong?.title}</h5>
											<p
												className="artist-name"
												style={{ borderBottom: "2px dotted" }}
											>
												ALBUM: {currentSong?.album || 'unkown'}
											</p>
											<p
												className="artist-name"
												style={{ borderBottom: "2px dotted" }}
											>
												ARTIST: {currentSong?.artist || 'unkown'}
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="col-md-6 col-sm-6">
								<div
									className="show-item link-item"
									style={{ borderRadius: 10, cursor: "auto" }}
								>
									<img src="assets/images/shows/previous/2.jpg" alt="image" />
									<div className="show-item-content">
										<div
											className="section-top col-sm-10 "
											style={{
												justifyContent: "end",
												width: "100%",
												textAlign: "end",
												alignItems: "end",
												margin: "top -20px"
											}}
										>
											<span
												className="top-title"
												style={{ marginBottom: "3rem", marginLeft: 12 }}
											>
												Next Playing
											</span>
											<h2 className="section-title"> </h2>
										</div>
										<div
											className="artist-content"
											style={{
												paddingLeft: "0% !important",
												paddingRight: "0% !important",
												width: "100%"
											}}
										>
											<h5 className="show-name">{nextSong?.title || 'unkown'}</h5>
											<p
												className="artist-name"
												style={{ borderBottom: "2px dotted" }}
											>
												ALBUM: {nextSong?.album || 'unkown'}
											</p>
											<p
												className="artist-name"
												style={{ borderBottom: "2px dotted" }}
											>
												ARTIST: {nextSong?.album || 'unkown'}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				{/* previous show section end */}
				{/*table start */}
				<section
					className=" pb-120 dark-overlay position-relative z-index2"
					style={{ backgroundImage: 'url("assets/images/bg/bg1.jpg")' }}
				>
					<div className="left-el">
						<img src="assets/images/elements/el_plus.png" alt="image" />
					</div>
					<div className="right-el">
						<img src="assets/images/elements/right-dot-circle.png" alt="image" />
					</div>
					<div className="container ">
						<div
							className="top-title"
							style={{
								padding: "77px 0px 77px 0px",
								alignItems: "center",
								textAlign: "center",
								justifyContent: "center"
							}}
						>
							Recent History
						</div>
						<div className="table-responsive">
							<table
								className="table "
								style={{
									borderRadius: 10,
									color: "rgb(190, 190, 190)",
									borderLeft: "1px solid  #0a0707",
									borderTop: "1px solid  #0a0707",
									overflow: "hidden"
								}}
							>
								<thead>
									<tr>
										<th>Title</th>
										<th>Artist</th>
										<th>Album</th>
										<th>Hours/Date</th>
										<th>Purchase</th>
									</tr>
								</thead>
								<tbody id="table-body">
									{history && history.map((song) => (
										<tr>
											<td>{song.title}</td>
											<td>{song.artist || 'Unknown'}</td>
											<td>{song.album || 'Unknown'}</td>
											<td>{song.date}</td>
											<td> <a href="/history" class="btn btn-main">Buy Album </a>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>
				{/*table end */}
				<div
					className="qt-vertical-padding-s qt-negative"
					style={{ paddingTop: 22, paddingBottom: 22, backgroundColor: "black" }}
				>
					<div
						className="qt-container"
						style={{ paddingTop: 10, width: "90%", margin: "auto" }}
					>
						<div className="row">
							<div className="col-md-4">
								<div className="qt-item">
									{/* SHOW UPCOMING ITEM ========================= */}
									<div className="qt-part-archive-item qt-part-archive-item-show qt-negative">
										<div className="qt-item-header">
											<a xxhref="http://radio.hallelujahgospel.com/#">
												<video muted="" autoPlay="" loop="" width="100%">
													<source
														src="https://hgcradio.com/storage/app/public/ads/your_ad_here_redone_1.mp4"
														type="video/mp4"
													/>
													Sorry, your browser doesn't support embedded videos.
												</video>
											</a>
										</div>
									</div>
									{/* SHOW UPCOMING ITEM END ========================= */}
								</div>
							</div>
							<div className="col-md-4">
								<div className="qt-item">
									{/* SHOW UPCOMING ITEM ========================= */}
									<div className="qt-part-archive-item qt-part-archive-item-show qt-negative">
										<div className="qt-item-header">
											<a xxhref="http://radio.hallelujahgospel.com/#">
												<video muted="" autoPlay="" loop="" width="100%">
													<source
														src="https://hgcradio.com/storage/app/public/ads/your_ad_here_redone_2.mp4"
														type="video/mp4"
													/>
													Sorry, your browser doesn't support embedded videos.
												</video>
											</a>
										</div>
									</div>
									{/* SHOW UPCOMING ITEM END ========================= */}
								</div>
							</div>
							<div className="col-md-4">
								<div className="qt-item">
									{/* SHOW UPCOMING ITEM ========================= */}
									<div className="qt-part-archive-item qt-part-archive-item-show qt-negative">
										<div className="qt-item-header">
											<a xxhref="http://radio.hallelujahgospel.com/#">
												<video muted="" autoPlay="" loop="" width="100%">
													<source
														src="https://hgcradio.com/storage/app/public/ads/your_ad_here_redone_3.mp4"
														type="video/mp4"
													/>
													Sorry, your browser doesn't support embedded videos.
												</video>
											</a>
										</div>
									</div>
									{/* SHOW UPCOMING ITEM END ========================= */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			{/* site-body end */}
			{/* footer section start */}
			<footer className="footer-section">
				<div className="container">
					<div className="row gy-5 justify-content-between">
						<div className="col-lg-4">
							<h5 className="" style={{ fontSize: "1.4rem", color: "#ffffff" }}>
								Contact Us/Mail To
							</h5>
							<ul className="footer-info-list">
								<li
									style={{
										borderBottom: "0.6px solid rgba(255, 255, 255, 0.5)",
										padding: "4px 0px 4px 0px"
									}}
								>
									<i className="fas fa-map-marker-alt" />
									<p>
										Hallelujah Gospel Globally 231 Market Place 195 San Ramon CA,
										94583, USA
									</p>
								</li>
								<li
									style={{
										borderBottom: "0.6px solid rgba(255, 255, 255, 0.5)",
										padding: "4px 0px 4px 0px"
									}}
								>
									<i className="far fa-envelope" />
									<p>
										<a href="mailto:contact.FMland@gmail.com">
											Radio@hallelujahgospel.com
										</a>
									</p>
								</li>
								<span
									className="social-icons"
									style={{
										padding: "13px 0px 12px 0px",
										borderBottom: "0.6px solid rgba(255, 255, 255, 0.5)",
										width: "100%"
									}}
								>
									<li>
										<a href="#0">
											<i className="fab fa-facebook-f" />
										</a>
									</li>
									<li>
										<a href="#0">
											<i className="fab fa-linkedin-in" />
										</a>
									</li>
									<li>
										<a href="#0">
											<i className="fab fa-twitter" />
										</a>
									</li>
									<li>
										<a href="#0">
											<i className="fab fa-instagram" />
										</a>
									</li>
								</span>
							</ul>
						</div>
						<div className="col-lg-4 col-sm-4 col-6" style={{ paddingLeft: 29 }}>
							<h5>Important Links</h5>
							<ul className="footer-general-menu">
								<li
									style={{
										borderBottom: "1px solid white",
										width: "35%",
										padding: "4px 0px 4px 0px"
									}}
								>
									<i className="fas fa-angle-right" style={{ marginRight: 6 }} />
									<a href="/">
										<span>Home</span>
									</a>
								</li>
								<li
									style={{
										borderBottom: "1px solid white",
										width: "35%",
										padding: "4px 0px 4px 0px"
									}}
								>
									<i className="fas fa-angle-right" style={{ marginRight: 6 }} />
									<a href="about.html">
										<span>About Us</span>
									</a>
								</li>
								<li
									style={{
										borderBottom: "1px solid white",
										width: "37%",
										padding: "4px 0px 4px 0px"
									}}
								>
									<i className="fas fa-angle-right" style={{ marginRight: 6 }} />
									<a href="privacy.html">
										<span>Privacy Policy</span>
									</a>
								</li>
								<li
									style={{
										borderBottom: "1px solid white",
										width: "35%",
										padding: "4px 0px 4px 0px"
									}}
								>
									<i className="fas fa-angle-right" style={{ marginRight: 6 }} />
									<a href="contact.html">
										<span>Contact Us</span>
									</a>
								</li>
							</ul>
						</div>
						<div className="col-lg-4 col-sm-4 col-6">
							<h5>Gospel Choice Radio</h5>
							<div style={{ paddingTop: 19 }}>
								Gospel Music Focus: Hallelujah Gospel Choice Radio specializes in
								playing gospel music, which is a genre that carries deep spiritual
								and uplifting messages. Gospel music has a unique ability to touch
								people's hearts and inspire them with its soulful melodies and
								powerful lyrics
								<a style={{ color: "red", marginLeft: 4 }} href="sponsor.html">
									Read More
								</a>
							</div>
						</div>
					</div>
					<div className="footer-copy-right-area">
						<div
							className="row gy-3 align-items-center"
							style={{ justifyContent: "center", alignItems: "center" }}
						>
							<div className="col-lg-6">
								<p className="copy-right-text text-lg-start text-center">
									© Copyright <span style={{ color: "red" }}>2023</span>
									All Rights Reserved By -{" "}
									<span style={{ color: "red" }}>
										{" "}
										Hallelujah Gospel Globally
									</span>{" "}
								</p>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</>

	);
}