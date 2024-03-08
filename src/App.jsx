import { useState } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [smartLink, setSmartLink] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const clientId = "d7674ea1f7094ec3a86bf71ac0ada810";
  const clientSecret = "1c6afec48a294eee93cd25b1f097570e";

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

    return data.access_token;
  };

  const handleSearch = async () => {
    try {
      let spotifyLink = '';
  
      // Check if the search query is a Spotify URL
      if (searchQuery.includes('spotify.com')) {
        spotifyLink = searchQuery;
      } else {
        // Get access token
        const accessToken = await getToken();
  
        // Perform a search on Spotify
        const response = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        console.log(data);
  
        // Extract the Spotify link for the first track
        if (data.tracks.items.length > 0) {
          spotifyLink = data.tracks.items[0].external_urls.spotify;
          setSearchResults(data.tracks.items); // Update search results state
        }
      }
  
      // Generate the smart link
      const generatedSmartLink = spotifyLink;
      setSmartLink(generatedSmartLink);
      setShowSearchResults(false); // Hide search results after clicking search button
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleCopyLink = () => {
    // Copy smart link to clipboard
    navigator.clipboard.writeText(smartLink);
  };

  const handleChange =async (e) => {
    const { value } = e.target;
    setSearchQuery(value);
    if (value.trim() !== '') {
      await handleSearch(value);
      setShowSearchResults(true); // Show search results when typing
    } else {
      setShowSearchResults(false); // Hide search results when input is empty
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh" }}>
      <div style={{width:"500px",position:"relative"}}>
        <h1>Smart Link Setup</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Enter artist, song, album, or Spotify URL"
        /><button onClick={handleSearch}>Search</button>
        <div style={{position:"absolute",top:"160px",border:"2px solid gray",backgroundColor:"white"}}>
        {showSearchResults && (
          <div style={{height:"100px",width:"100%",minWidth:"100%",overflow:"auto"}}>
            <ul>
              {searchResults.map(result => (
                <li style={{cursor:"pointer"}} onClick={()=>{setSearchQuery(result.name),setShowSearchResults(false)}} key={result.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={result.album.images[0].url} alt={result.name} width="30" height="30" />
                  <p>{result.name}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
        
        {smartLink && (
          <div>
            <p>Generated Smart Link:</p>
            <div>
              <a href={smartLink} target="_blank" rel="noopener noreferrer">
                {smartLink}
              </a>
              <button onClick={handleCopyLink}>Copy Link</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
