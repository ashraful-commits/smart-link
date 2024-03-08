import { useState } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [smartLink, setSmartLink] = useState('');
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
        if (dataSpotify.tracks.items.length > 0) {
          spotifyLink = dataSpotify.tracks.items[0].external_urls.spotify;
          setSearchResults(dataSpotify.tracks.items); // Update search results state
        }

        // Perform a search on YouTube
        const responseYoutube = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${youtubeApi}&part=snippet&q=${searchQuery}&type=video&maxResults=1`);
        const dataYoutube = await responseYoutube.json();

        // Extract YouTube link
        if (dataYoutube.items.length > 0) {
          youtubeLink = `https://www.youtube.com/watch?v=${dataYoutube.items[0].id.videoId}`;
        }
      }

      // Generate the smart link
      const generatedSmartLink = { spotify: spotifyLink, youtube: youtubeLink };
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

      // Extract YouTube link
      const youtubeLink = dataYoutube.items.length > 0 ? `https://www.youtube.com/watch?v=${dataYoutube.items[0].id.videoId}` : '';
      setSmartLink({ spotify: '', youtube: youtubeLink });
    } else {
      setShowSearchResults(false); // Hide search results when input is empty
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh", backgroundImage: "linear-gradient(to top, green, gray)" }}>
      <div style={{ width: "700px", backgroundColor: "white", height: "500px", position: "relative", border: "2px solid gray ", padding: "20px", borderRadius: "20px", boxShadow: "0 0 10px gray" }}>
        <h1>Smart Link Generator</h1>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <input
            style={{ width: "100%" }}
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Enter artist, song, album, or Spotify URL"
          /><button onClick={handleSearch}>Search</button>
        </div>
        <div style={{ position: "absolute", top: "185px", border: "2px solid gray", backgroundColor: "white" }}>
          {showSearchResults && (
            <div style={{ height: "300px", width: "695px", minWidth: "500px", overflow: "auto" }}>
              <ul>
                {searchResults.map(result => (
                  <li style={{ cursor: "pointer" }} onClick={() => { setSearchQuery(result.name); setShowSearchResults(false) }} key={result.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {result.album && (
                      <img src={result.album.images[0].url} alt={result.name} width="30" height="30" />
                    )}
                    <p>{result.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {showLink && (
          <div>
            <p>Generated Smart Links:</p>
            {smartLink.spotify && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a style={{ width: "70%" }} href={smartLink.spotify} target="_blank" rel="noopener noreferrer">
                  Spotify: {smartLink.spotify}
                </a>
                <button onClick={() => handleCopyLink(smartLink.spotify)}>Copy Spotify Link</button>
              </div>
            )}
            {smartLink.youtube && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a style={{ width: "70%" }} href={smartLink.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube: {smartLink.youtube}
                </a>
                <button onClick={() => handleCopyLink(smartLink.youtube)}>Copy YouTube Link</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
