import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

// Custom Video Player with HTTP to HTTPS proxy interceptor
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

      const initialUrl = url.startsWith('http://') 
        ? `https://corsproxy.io/?${encodeURIComponent(url)}` 
        : url;

      hls.loadSource(initialUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.levels && hls.levels.length > 0) {
          hls.currentLevel = hls.levels.length - 1; // Force HD
        }
        video.play().catch(e => console.log('Autoplay blocked:', e));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url.startsWith('http://') ? `https://corsproxy.io/?${encodeURIComponent(url)}` : url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url]);

  return (
    <video 
      ref={videoRef} 
      controls 
      autoPlay 
      muted 
      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
    />
  );
};

const channels = [
  { id: 1, name: 'PTV Sports', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e4/PTV_Sports.png', isLive: true, streamUrl: 'http://198.195.239.50:8095/ptv/index.m3u8' },
  { id: 2, name: 'beIN Sports Xtra', logo: 'https://static.wikia.nocookie.net/logopedia/images/b/b5/XTRA_2.png/revision/latest/scale-to-width-down/250?cb=20201108180658', isLive: true, streamUrl: 'https://amg01334-amg01334c2-freelivesports-emea-6791.playouts.now.amagi.tv/playlist/amg01334-beinxtra-beinxtrausapp-freelivesportsemea/playlist.m3u8' },
  { id: 3, name: 'Win Sports', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Win_Sports_nuevo_logo.svg/3840px-Win_Sports_nuevo_logo.svg.png', isLive: false, streamUrl: 'https://1nyaler.streamhostingcdn.top/stream/32/index.m3u8' },
  { id: 4, name: 'TNT Sports Premium', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS72dyeDbjigwXfnfixEtbAWdPDB18y283059B11zi2zw&s=10', isLive: false, streamUrl: 'https://1nyaler.streamhostingcdn.top/stream/30/index.m3u8' },
  { id: 5, name: 'beIN Sports 1', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV-7LwV1rHhmIG8eIyApJJ4WhqLR_Rrg2kxr0wQGZhWQ&s=10', isLive: true, streamUrl: 'https://1nyaler.streamhostingcdn.top/stream/23/index.m3u8' },
  { id: 6, name: 'FIFA+', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvVpgdfec1KvDNJ1YGcCSM9S8y4Yo0xTqcu4ls-47Ptw&s=10', isLive: true, streamUrl: 'https://d63fabad.wurl.com/manifest/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWVzX0ZJRkFQbHVzU3BhbmlzaF9ITFM/1e7d5a77-89f1-49e8-b5cf-bb6e45be5a09/1.m3u8' },
  { id: 7, name: 'DAZN', logo: 'data:image/png;base64,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', isLive: true, streamUrl: 'https://1nyaler.streamhostingcdn.top/stream/94/index.m3u8' },
  { id: 8, name: 'CCTV 5', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy_WI9V-BhHRyuAJ4MuygemyeZZ2J87sG6xfFZUWajFQ&s=10', isLive: true, streamUrl: 'https://live12.xiazhix1.top/live/85042987.m3u8' }
];

export default function App() {
  const [activeChannel, setActiveChannel] = useState(2); 
  const [latestMatches, setLatestMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [heroMatch, setHeroMatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Date Range Generator (YYYYMMDD format)
  const getDynamicDates = () => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 4); // 4 days ago history
    const future = new Date();
    future.setDate(now.getDate() + 7); // 7 days upcoming schedule

    const format = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    };
    return `${format(past)}-${format(future)}`;
  };

  const parseESPNMatch = (event: any) => {
    const comp = event.competitions?.[0];
    const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
    const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
    
    return {
      id: event.id,
      homeTeam: home?.team?.name || home?.team?.shortDisplayName || 'Home',
      awayTeam: away?.team?.name || away?.team?.shortDisplayName || 'Away',
      homeScore: home?.score || '0',
      awayScore: away?.score || '0',
      date: event.date,
      state: event.status?.type?.state, // 'pre', 'in', 'post'
      clock: event.status?.displayClock || '0:00'
    };
  };

  useEffect(() => {
    const fetchLiveGames = async () => {
      try {
        const dateParam = getDynamicDates();
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateParam}&limit=50`);
        const data = await response.json();
        
        if (!data.events || data.events.length === 0) {
          setIsLoading(false);
          return;
        }

        const allMatches = data.events.map(parseESPNMatch);

        // Filter and Sort chronologically
        const finished = allMatches.filter((m: any) => m.state === 'post').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const upcoming = allMatches.filter((m: any) => m.state === 'pre').sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const live = allMatches.filter((m: any) => m.state === 'in');

        setLatestMatches(finished.slice(0, 4));
        setUpcomingMatches(upcoming.slice(0, 4));

        // Logic: Live Match > Next Upcoming Match > Last Finished Match
        setHeroMatch(live[0] || upcoming[0] || finished[0] || null);
        setIsLoading(false);

      } catch (err) {
        console.error('ESPN API Fetch Error:', err);
        setIsLoading(false);
      }
    };

    fetchLiveGames();
    const interval = setInterval(fetchLiveGames, 30000); // 30 seconds auto-refresh
    
    return () => clearInterval(interval);
  }, []);

  const formatTime12Hr = (dateString: string) => {
    if (!dateString) return 'TBD';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return String(dateString);
    
    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateObj.toDateString() === today.toDateString()) return `Today, ${timeString}`;
    else if (dateObj.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${timeString}`;
    else {
      return `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeString}`;
    }
  };

  const isHeroLive = heroMatch?.state === 'in';
  const activeChannelData = channels.find(c => c.id === activeChannel);

  const Tables = () => (
    <>
      <div className="flex flex-col flex-1">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Previous Matches</h3>
        <div className="bg-[#111] border border-zinc-800 rounded overflow-hidden">
          <div className="flex flex-col divide-y divide-zinc-800">
            {latestMatches.length > 0 ? (
              latestMatches.map((match, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-zinc-900/50 transition-colors">
                  <div className="text-[11px] font-medium text-zinc-300 w-[35%] truncate">{match.homeTeam}</div>
                  <div className="text-[11px] w-[30%] text-center text-white font-semibold">
                    {match.homeScore} &mdash; {match.awayScore}
                  </div>
                  <div className="text-[11px] text-zinc-500 w-[35%] text-right truncate">{match.awayTeam}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[11px] text-zinc-600">No recent history available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 mt-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Upcoming Matches</h3>
        <div className="bg-[#111] border border-zinc-800 rounded overflow-hidden">
          <div className="flex flex-col divide-y divide-zinc-800">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-zinc-900/50 transition-colors">
                  <div className="text-[11px] font-medium text-zinc-300 truncate">
                    {match.homeTeam} <span className="text-zinc-600 mx-1">vs</span> {match.awayTeam}
                  </div>
                  <div className="text-[11px] text-[#00ff00] whitespace-nowrap text-right">
                    {formatTime12Hr(match.date)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[11px] text-zinc-600">No future matches found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-black text-zinc-300 font-sans lg:flex-row">
      
      {/* MOBILE CONTAINER */}
      <div className="flex-shrink-0 z-50 shadow-md lg:hidden flex flex-col border-b border-zinc-900 bg-black">
        <div className="bg-[#111] border-b border-zinc-800 px-4 py-3 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase text-zinc-500">
              {isHeroLive ? <><span className="w-1.5 h-1.5 rounded-full bg-[#00ff00] animate-pulse"></span> <span className="text-[#00ff00]">LIVE</span></> : 'FIFA 2026'}
            </div>
            <div className="text-[10px] font-mono text-[#00ff00] bg-[#00ff00]/10 px-2 py-0.5 rounded">
              {isHeroLive ? heroMatch?.clock : (heroMatch ? formatTime12Hr(heroMatch.date) : 'TBD')}
            </div>
          </div>
          <div className="font-black text-[13px] tracking-wide text-white flex items-center justify-center text-center w-full overflow-hidden">
            <span className="truncate flex-1 text-right">{heroMatch?.homeTeam?.toUpperCase() || 'LOADING'}</span>
            <span className="text-zinc-600 font-medium px-3 flex-shrink-0 text-[11px]">{isHeroLive ? `${heroMatch?.homeScore} — ${heroMatch?.awayScore}` : 'VS'}</span>
            <span className="truncate flex-1 text-left">{heroMatch?.awayTeam?.toUpperCase() || 'LOADING'}</span>
          </div>
        </div>
        
        <div className="w-full aspect-video bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
          {activeChannelData?.streamUrl ? (
            <HlsVideoPlayer url={activeChannelData.streamUrl} />
          ) : (
            <div className="text-white text-sm">Stream Unavailable</div>
          )}
        </div>
      </div>

      {/* DESKTOP CONTAINER */}
      <div className="hidden lg:flex lg:flex-col lg:w-[70%] lg:flex-shrink-0 lg:border-r lg:border-zinc-800 bg-black h-screen">
        <div className="w-full aspect-video 2xl:max-h-[55vh] object-cover bg-[#0a0a0a] border-b border-zinc-900 relative flex items-center justify-center overflow-hidden flex-shrink-0">
           {activeChannelData?.streamUrl ? (
             <HlsVideoPlayer url={activeChannelData.streamUrl} />
           ) : (
             <div className="text-white text-sm">Stream Unavailable</div>
           )}
           <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
              <span className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-[#00ff00] border border-[#00ff00]/30">
                <span className="w-1.5 h-1.5 bg-[#00ff00] rounded-full animate-pulse"></span> LIVE
              </span>
              <span className="bg-black/60 px-2 py-1 rounded text-[10px] font-medium text-white shadow-sm">1080p60</span>
           </div>
        </div>
        
        {/* HERO SCOREBOARD */}
        <div className="flex-1 overflow-y-auto bg-black flex flex-col items-center justify-center p-6 lg:p-10 custom-scrollbar">
          <div className="w-full max-w-3xl flex flex-col items-center justify-center">
             <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-6 text-center">
                  {isHeroLive ? 'Live Match Dashboard' : 'FIFA World Cup 2026 — Official Scoreboard'}
             </div>
             
             <div className="flex flex-col md:flex-row items-center justify-center w-full gap-6 md:gap-12">
                <div className="flex flex-col items-center text-center w-full md:w-1/3">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#111] rounded-full mb-3 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner uppercase font-black text-zinc-600">
                    {heroMatch?.homeTeam ? heroMatch.homeTeam.charAt(0) : '⚽'}
                  </div>
                  <div className="text-[12px] md:text-sm font-bold text-zinc-300 uppercase tracking-wide">{heroMatch?.homeTeam || 'NO EVENTS'}</div>
                </div>

                <div className="flex flex-col items-center px-2 md:px-6 w-full md:w-1/3 text-center my-4 md:my-0">
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
                    {isLoading ? '...' : (isHeroLive ? `${heroMatch?.homeScore} — ${heroMatch?.awayScore}` : 'VS')}
                  </div>
                  <div className="text-[11px] md:text-xs font-mono text-[#00ff00] bg-[#00ff00]/10 px-4 py-1.5 rounded-full inline-block whitespace-nowrap">
                    {isLoading ? 'LOADING' : (isHeroLive ? heroMatch?.clock : (heroMatch ? formatTime12Hr(heroMatch.date) : 'NO DATA'))}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center w-full md:w-1/3">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#111] rounded-full mb-3 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner grayscale opacity-70 uppercase font-black text-zinc-600">
                    {heroMatch?.awayTeam ? heroMatch.awayTeam.charAt(0) : '⚽'}
                  </div>
                  <div className="text-[12px] md:text-sm font-bold text-zinc-300 uppercase tracking-wide">{heroMatch?.awayTeam || 'NO EVENTS'}</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="flex-1 overflow-y-auto pb-4 lg:pb-0 lg:w-[30%] bg-[#050505] flex flex-col z-10 custom-scrollbar relative">
         <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#050505] sticky top-0 z-20">
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Live Channels</h2>
             <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{channels.length} Available</span>
         </div>
         
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
           {channels.map(channel => {
             const isActive = activeChannel === channel.id;
             return (
             <div 
               key={channel.id} 
               onClick={() => setActiveChannel(channel.id)}
               className={`p-3 border-b border-zinc-900 hover:bg-zinc-900/30 cursor-pointer group flex items-center gap-3 transition-colors ${isActive ? 'bg-zinc-900/20 border-l-2 border-l-[#00ff00]' : 'border-l-2 border-l-transparent'}`}
             >
               <div className="relative flex-shrink-0">
                 <img src={channel.logo} alt={channel.name} className="w-10 h-10 object-contain bg-white/90 rounded-full p-1" loading="lazy" />
                 {channel.isLive && (
                   <div className="absolute bottom-0 right-0 bg-[#00ff00] w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,255,0,0.8)] border border-[#050505]"></div>
                 )}
               </div>
               <div className="flex-1">
                 <div className={`text-[12px] font-bold leading-tight mb-0.5 transition-colors line-clamp-1 ${isActive ? 'text-white group-hover:text-[#00ff00]' : 'text-zinc-300'}`}>{channel.name}</div>
                 <div className="text-[10px] text-zinc-500 line-clamp-1">
                   {channel.isLive ? 'Live Event Stream' : 'Offline'}
                 </div>
                 <div className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider">
                   {channel.isLive ? 'Main Feed • HD' : 'VOD'}
                 </div>
               </div>
             </div>
           )})}
         </div>

         <div className="p-4">
            <div className="flex flex-col gap-6">
              <Tables />
            </div>
         </div>
         <div className="flex-1"></div>
         <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a] mt-auto">
           <div className="text-[9px] text-zinc-600 text-center tracking-widest uppercase">
             Developed by Nahi
           </div>
         </div>
      </div>
    </div>
  );
}