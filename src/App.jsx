import { useState } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [smartLink, setSmartLink] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const clientId = "d7674ea1f7094ec3a86bf71ac0ada810";
  const clientSecret = "1c6afec48a294eee93cd25b1f097570e";
  const youtubeApi = "AIzaSyD6H8DQW8VxFVa2v0Ukuk2gevqm5bSeZkg";

  const getToken = async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`), // Use btoa to encode client ID and client secret
      },
    });

    const data = await response.json();
    setShowLink(true);
    return data.access_token;
  };

  const handleSearch = async () => {
    try {
      let spotifyLink = '';
      let youtubeLink = '';

      // Check if the search query is a Spotify URL
      if (searchQuery.includes('spotify.com')) {
        spotifyLink = searchQuery;
      } else {
        // Get access token
        const accessToken = await getToken();

        // Perform a search on Spotify
        const responseSpotify = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const dataSpotify = await responseSpotify.json();

        // Extract the Spotify link for the first track
        if (dataSpotify.tracks?.items?.length > 0) {
          spotifyLink = dataSpotify.tracks.items[0].external_urls.spotify;
          setSearchResults(dataSpotify.tracks.items); // Update search results state
        }

        // Perform a search on YouTube
        const responseYoutube = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${youtubeApi}&part=snippet&q=${searchQuery}&type=video&maxResults=1`);
        const dataYoutube = await responseYoutube.json();

        // Extract YouTube link
        if (dataYoutube?.items?.length > 0) {
          youtubeLink = `https://www.youtube.com/watch?v=${dataYoutube.items[0].id.videoId}`;
        }
      }

      // Generate the smart link
      const generatedSmartLink = { spotify: spotifyLink?spotifyLink:"", youtube: youtubeLink?youtubeLink:"" };
      setSmartLink(generatedSmartLink);
      setShowSearchResults(false); // Hide search results after clicking search button
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleCopyLink = (link) => {
    // Copy link to clipboard
    navigator.clipboard.writeText(link);
  };

  const handleChange = async (e) => {
    const { value } = e.target;
    setSearchQuery(value);
    if (value.trim() !== '') {
      const accessToken = await getToken(); // Get access token

      // Perform a search on Spotify
      const responseSpotify = await fetch(`https://api.spotify.com/v1/search?q=${value}&type=track`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const dataSpotify = await responseSpotify.json();

      // Extract the Spotify link for the first track
      if (dataSpotify.tracks.items.length > 0) {
        setSearchResults(dataSpotify.tracks.items); // Update search results state
        setShowSearchResults(true); // Show search results when typing
      }
      // Perform a search on YouTube
      const responseYoutube = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${youtubeApi}&part=snippet&q=${value}&type=video&maxResults=1`);
      const dataYoutube = await responseYoutube.json();
      const youtubeLink = dataYoutube.items.length > 0 ? `https://www.youtube.com/watch?v=${dataYoutube.items[0].id.videoId}` : '';
      setSmartLink({ spotify: '', youtube: youtubeLink });
    } else {
      setShowSearchResults(false); 
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-b from-green-500 to-orange-400">
      <div className="w-[700px] bg-green-500 overflow-hidden h-[700px] rounded-tl-none rounded-tr-none rounded-2xl p-5" >
        <h1 className="my-5 text-4xl font-bold text-center">Smart Link Generator</h1>
        <div className="relative flex justify-between w-full h-12">
          <input
          className="w-[85%] h-full px-3 focus:border-none focus:outline-none"
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Enter artist, song, album, or Spotify URL"
          />
          <button className="w-[15%] border hover:bg-gray-700 hover:text-white transition-all duration-500 ease-in-out bg-white text-gray-700 h-full" onClick={handleSearch}>Search</button>
       
          {showSearchResults && (
          <div className="absolute overflow-y-auto top-[48px] shadow-md bg-white w-full max-h-[500px] border-2 p-3" >
            <div className="w-full h-full overflow-hidden">
              <ul className="flex flex-col gap-y-4">
                {searchResults.map(result => (
                  <li className="py-2 border-b " onClick={() => { setSearchQuery(result.name); setShowSearchResults(false) }} key={result.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {result.album && (
                      <img className="rounded-md" src={result.album.images[0].url} alt={result.name} width="30" height="30" />
                    )}
                    <p>{result.name}</p>
                  </li>
                ))}
              </ul>
            </div>
        </div>
          )}
        </div>
       

        {showLink && (
          <div className="p-4 ">
            <p className="py-1 my-3 text-lg font-bold text-white border-b">Generated Smart Links:</p>
            {smartLink.spotify && (
              <div className="flex items-center justify-between w-full h-12 pl-3 mb-3 bg-white border shadow-2xl">
                <a className="inline-block truncate"  href={smartLink.spotify} target="_blank" rel="noopener noreferrer">
                  Spotify: {smartLink.spotify}
                </a>
                <button className="flex items-center justify-center h-full px-2 font-bold bg-green-500 hover:text-white" onClick={() => handleCopyLink(smartLink.spotify)}>Copy</button>
              </div>
            )}
            {smartLink.youtube && (
              <div className="flex items-center justify-between w-full h-12 pl-3 mb-3 bg-white border shadow-2xl">
                <a className="inline-block truncate" href={smartLink.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube: {smartLink.youtube}
                </a>
                <button className="flex items-center justify-center h-full px-2 font-bold bg-youtube-500 hover:text-white" onClick={() => handleCopyLink(smartLink.youtube)}>Copy Link</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
