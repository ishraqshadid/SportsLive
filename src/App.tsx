import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

// Custom Video Player
const HlsVideoPlayer = ({ url }: { url: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    let hls: Hls;
    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 60,
        xhrSetup: function (xhr, requestUrl) {
          if (requestUrl.startsWith('http://')) {
            const secureProxyUrl = `https://corsproxy.io/?${encodeURIComponent(requestUrl)}`;
            xhr.open('GET', secureProxyUrl, true);
          }
        }
      });
      hls.loadSource(url.startsWith('http://') ? `https://corsproxy.io/?${encodeURIComponent(url)}` : url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        hls.currentLevel = hls.levels.length - 1;
        video.play().catch(e => console.log('Autoplay:', e));
      });
    }
    return () => { if (hls) hls.destroy(); };
  }, [url]);
  return <video ref={videoRef} controls autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />;
};

// --- AADS BANNER COMPONENT ---
const AadsBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  return (
    <div style={{ position: 'relative', width: '100%', padding: '10px 0', textAlign: 'center' }}>
      <button onClick={() => setIsVisible(false)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(248, 248, 249, 0.70)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', zIndex: 99 }}>
        <svg fill="#000000" height="12px" width="12px" viewBox="0 0 490 490"><polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/></svg>
      </button>
      <iframe title="AADS-Banner" data-aa="2444042" src="//acceptable.a-ads.com/2444042/?size=Adaptive&background_color=111111" style={{ border: 0, width: '100%', maxWidth: '728px', minHeight: '90px' }} scrolling="no"></iframe>
    </div>
  );
};

export default function App() {
  const [activeChannel, setActiveChannel] = useState(2); 
  const [heroMatch, setHeroMatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- AADS MAIN AD (VIGNETTE/POP) LOGIC ---
  useEffect(() => {
    const runMainAd = () => {
      const lastAd = localStorage.getItem('lastAadsMainAd');
      const now = new Date().getTime();
      if (!lastAd || now - parseInt(lastAd) > 20 * 60 * 1000) {
        // AADS Main Ad Script Injection
        const script = document.createElement('script');
        script.src = "//rotator.a-ads.com/YOUR_AADS_MAIN_AD_ID_HERE"; // REPLACE WITH YOUR AADS MAIN AD SCRIPT URL
        script.async = true;
        document.body.appendChild(script);
        localStorage.setItem('lastAadsMainAd', now.toString());
      }
    };
    const timer = setTimeout(runMainAd, 7000); // 7 Seconds Delay
    return () => clearTimeout(timer);
  }, []);

  // [REST OF YOUR EXISTING LOGIC FOR CHANNELS/MATCHES...]
  const channels = [{ id: 1, name: 'PTV Sports', streamUrl: 'http://198.195.239.50:8095/ptv/index.m3u8' }, { id: 2, name: 'beIN Sports', streamUrl: 'https://amg01334-amg01334c2-freelivesports-emea-6791.playouts.now.amagi.tv/playlist/amg01334-beinxtra-beinxtrausapp-freelivesportsemea/playlist.m3u8' }];
  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <div className="h-screen flex flex-col bg-black text-zinc-300 lg:flex-row">
      <div className="flex-shrink-0 lg:w-[70%] bg-black">
        <div className="w-full aspect-video relative">
          {activeChannelData && <HlsVideoPlayer url={activeChannelData.streamUrl} />}
        </div>
        
        {/* BANNER LOCATION */}
        <div className="w-full bg-[#050505] border-b border-zinc-800 flex items-center justify-center">
           <AadsBanner />
        </div>
      </div>
      
      <div className="flex-1 bg-[#050505] p-4">
        {/* CHANNELS LIST */}
        <h2 className="text-white font-bold">Channels</h2>
        {channels.map(c => <div key={c.id} onClick={() => setActiveChannel(c.id)} className="cursor-pointer p-2 hover:bg-zinc-800">{c.name}</div>)}
      </div>
    </div>
  );
}
