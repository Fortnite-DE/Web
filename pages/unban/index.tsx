import {NextPage} from "next";
import {useEffect, useState} from "react";
import { useRouter } from 'next/router';


const Unban: NextPage = () => {
    const [isRedirecting, setIsRedirecting] = useState(true);
    const [error, setError] = useState(false);

    const [timestamp, setTimestamp] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');

    const router = useRouter();

    async function fetchData() {
        const params = new URLSearchParams(window.location.search);
        let receivedTimestamp: number | null = null;
        let receivedSignature: string | null = null;

        if (params.has('timestamp'))
            receivedTimestamp = parseInt(params.get('timestamp')!, 0);

        if (params.has('signature'))
            receivedSignature = params.get('signature');

        if (!receivedTimestamp || !receivedSignature)
        {
            setIsRedirecting(false);
            return setError(true)
        }

        fetch(`https://auth.fn-discord.de/unban?timestamp=${receivedTimestamp}&signature=${receivedSignature}`)
        .then(response => response.json())
        .then(response => {
            if (response.status == 200)
                router.replace(response.redirect);
            else {
                setIsRedirecting(false);
                if (response.status == 403)
                    setTimestamp((receivedTimestamp ?? 0) * 1000);
                else
                    setError(true);
            }
        })
        .catch(error => {
            setIsRedirecting(false);
            setError(true);
        });
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (timestamp > 0 && timestamp > Date.now()) {
            const timer = setInterval(() => {
                const now = Date.now();
                const difference = timestamp - now;

                if (difference <= 0) {
                  clearInterval(timer);
                  fetchData();
                }
                else
                {
                  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                  const dayText = days === 1 ? "Tag" : "Tage";

                  setTimeLeft(`${days} ${dayText} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
                }
              }, 1000);

            return () => clearInterval(timer);
        }
      }, [timestamp]);

    if (isRedirecting)
        return null;

    return (
        <div>
            {error && (
                <>
                    <div>Der Link zum Entbannungsformular ist ungültig.</div>
                </>
            )}

            {timestamp !== 0 && timeLeft !== '' && (
                <>
                    <div>Du kannst einen Entbannungsantrag stellen ab: {new Date(timestamp).toLocaleString()}</div>
                    <div>{timeLeft}</div>
                </>
            )}
        </div>
    );
}

export default Unban