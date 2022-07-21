import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Client, Message } from '@stomp/stompjs';


var g_started;

function SynthesisWindow() {
    const [phrase, setPhrase] = useState("");

    const Say = (phrase) => {
        let utterance = new SpeechSynthesisUtterance(phrase);
        speechSynthesis.speak(utterance);
    }

    const SayClick = () => {
        Say(phrase);
    }

    // when press Enter in input, trigger SayClick
    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            SayClick();
        }
    }


    return (<div>
        <input type="text" value={phrase} onChange={(e) => setPhrase(e.target.value)} onKeyPress={onKeyPress} />
        <button onClick={SayClick}>Say</button>
    </div>)
}

function useRecognitionCollector(onFinal) {
    const [results, setResults] = useState([]);
    const finalized_ref = useRef([])
    useEffect(() => {
        // Walk backward looking for a finalized result
        const finalized = finalized_ref.current;
        if (results.length === 0) {
            finalized_ref.current = [];
            console.log("clearning finalized")
            return;
        }

        for (const result of results) {
            if (result.isFinal) {
                if (finalized.includes(result)) {
                    continue;
                } else {
                    finalized.push(result);
                    onFinal(result[0]);
                }
            }
        }
    }, [results]);
    return setResults;
}

function ASRWindow({ onFinal }) {
    const [result, setResult] = useState(null);
    const collector = useRecognitionCollector(onFinal)
    useEffect(() => {
        if (g_started) {
            //   return;
        }
        g_started = true;
        console.log("Starting ASR")
        const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;


        const colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', /* … */];
        const grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

        const recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();

        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;


        recognition.onresult = function (event) {
            collector(event.results);

            const transcripts = [];
            var index = 0;
            for (const r of event.results) {
                var transcript = r[0].transcript;
                transcripts.push((<li className={r.isFinal ? "final" : "interm"} key={index}>{transcript} {r[0].confidence}</li>))
                ++index;
            }
            // let color = event.results[0][0].transcript;
            // diagnostic.textContent = 'Result received: ' + color + '.';
            // bg.style.backgroundColor = color;
            setResult((<ul>{transcripts}</ul>));
        }


        recognition.onend = function (why) {
            console.log("ENDED");
            console.log(why);
            collector([]);
            if (why.type === 'end') {
                recognition.start();
            }
        }

        recognition.start();

        return () => {
            console.log("Stopping ASR")
            recognition.onend = null;
            recognition.stop();
        }
    }, [collector])

    return (
        <div className={styles.container}>
            <h1>ASR Window</h1>
            {result}
        </div>
    )
}

function ASRWindowControlled({ onFinal }) {
    const [listening, setListening] = useState(true);
    const OnFinal = (result) => {
        const startword = "alexand";
        if (result.transcript.indexOf("stop listening") !== -1) {
            setListening(false);
        } else if (result.transcript.toLowerCase().indexOf(startword) !== -1) {
            setListening(true);
        }
        if (listening) {
            onFinal(result);
        }
    };

    useEffect(() => {
        if (listening) {
            let utterance = new SpeechSynthesisUtterance("ready");
            speechSynthesis.speak(utterance);
            console.log("asdfasf")
        } else {
            let utterance = new SpeechSynthesisUtterance("not listening");
            speechSynthesis.speak(utterance);
        }
    }, [listening])
    return (
        <div>
            <div>
                {listening ? "Listening" : "Not listening"}
            </div>
            <ASRWindow onFinal={OnFinal} />
        </div>
    )
}

function useStomp() {
    const client_ref = useRef();

    const SendQueue = (q, msg) => {
        client_ref.current?.publish({
            destination: `/queue/${q}`,
            headers: {
                durable: false,
                "auto-delete": false,
                exclusive: false
            },
            body: msg
        });
    }

    useEffect(() => {
        var window_hostname = window.location.hostname;
        var stompurl = `ws://${window_hostname}:15674/ws`;

        const client = new Client({
            brokerURL: stompurl,
            connectHeaders: {
                login: 'guest',
                passcode: 'guest',
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = function (frame) {
            // Do something, all subscribes must be done is this callback
            // This is needed because this will be executed after a (re)connect
            console.log("On connect")
            client_ref.current = client;
        };

        client.onDisconnect = () => {
            console.log("on disconnect");
            client_ref.current = null;
        }

        client.onStompError = function (frame) {
            // Will be invoked in case of error encountered at Broker
            // Bad login/passcode typically will cause an error
            // Complaint brokers will set `message` header with a brief message. Body may contain details.
            // Compliant brokers will terminate the connection after any error
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };

        client.activate();

        return () => {
            client.deactivate();
        }
    }, [client_ref])

    return {
        SendQueue: SendQueue
    }
}

export default function Voice() {
    const stomp = useStomp();

    const OnFinal = (result) => {
        console.log("final result: ");
        console.log(result);
        stomp.SendQueue("webspeech", JSON.stringify({
            transcript: result.transcript.trim(),
            confidence: result.confidence
        }));
    }

    return (
        <div className={styles.container}>


            <main className={styles.main}>
                <h1 className={styles.title}>
                    VOICE
                </h1>

                <SynthesisWindow />
                <ASRWindowControlled onFinal={OnFinal} />
            </main>

        </div>
    )
}
