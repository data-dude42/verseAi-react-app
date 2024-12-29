import React, { useState, useEffect, useRef } from 'react'

export default function HomePage(props) {
    const { setAudioStream, setFile } = props

    const [recordingStatus, setRecordingStatus] = useState('inactive')
    const [audioChunks, setAudioChunks] = useState([])
    const [duration, setDuration] = useState(0)

    const mediaRecorder = useRef(null)

    const mimeType = 'audio/webm'

    async function startRecording() {
        let tempStream
        console.log('Start recording')

        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            })
            tempStream = streamData
        } catch (err) {
            console.log(err.message)
            return
        }
        setRecordingStatus('recording')

        //create new Media recorder instance using the stream
        const media = new MediaRecorder(tempStream, { type: mimeType })
        mediaRecorder.current = media

        mediaRecorder.current.start()
        let localAudioChunks = []
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') { return }
            if (event.data.size === 0) { return }
            localAudioChunks.push(event.data)
        }
        setAudioChunks(localAudioChunks)
    }

    async function stopRecording() {
        setRecordingStatus('inactive')
        console.log('Stop recording')

        mediaRecorder.current.stop()
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType })
            setAudioStream(audioBlob)
            setAudioChunks([])
            setDuration(0)
        }
    }

    useEffect(() => {
        if (recordingStatus === 'inactive') { return }

        const interval = setInterval(() => {
            setDuration(curr => curr + 1)
        }, 1000)

        return () => clearInterval(interval)
    })
    return (
        <main className="flex-1 p-4 flex flex-col gap-4 text-center justify-center pb-20 sm:gap-5">
            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-purple-500 font-bold">VerseAI</span>
            </h1>
            <h3 className="font-medium text-lg md:text-xl">
                Record <span className="text-blue-500">&rarr;</span> Transcribe <span className="text-blue-500">&rarr;</span> Translate
            </h3>
            <button
                onClick={recordingStatus === 'recording' ? stopRecording : startRecording}
                className="flex items-center justify-between gap-4 px-6 py-3 mx-auto text-base font-medium bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg focus:ring focus:ring-blue-300 w-80 max-w-full"
            >
                <p className="text-blue-500">
                    {recordingStatus === 'inactive' ? 'Record' : 'Stop recording'}
                </p>
                <div className="flex items-center gap-2">
                    <i
                        className={
                            'fa-solid fa-microphone duration-200' +
                            (recordingStatus === 'recording' ? ' text-red-400' : '')
                        }
                    ></i>
                </div>
            </button>
            <p className="text-sm md:text-base">
                Or{' '}
                <label className="text-blue-500 cursor-pointer hover:text-blue-600 duration-200">
                    upload{' '}
                    <input
                        onChange={(e) => {
                            const tempFile = e.target.files[0];
                            setFile(tempFile);
                        }}
                        className="hidden"
                        type="file"
                        accept=".mp3,.wave"
                    />
                </label>{' '}
                a mp3 file
            </p>
            <p className="font-semibold text-gray-700 text-sm tracking-wide">
                @SinghWorldWide.in
            </p>
        </main>
    );

}
