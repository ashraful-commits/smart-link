import { useState } from "react";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [smartLink, setSmartLink] = useState({});
  const [searchResults, setSearchResults] = useState([
    {
      type: "spotify",
      data: [],
    },
    {
      type: "youtube",
      data: [],
    },
    {
      type: "deezer",
      data: [],
    },
  ]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const clientId = "d7674ea1f7094ec3a86bf71ac0ada810";
  const clientSecret = "1c6afec48a294eee93cd25b1f097570e";
  const youtubeApi = "AIzaSyD6H8DQW8VxFVa2v0Ukuk2gevqm5bSeZkg";
  const deezerApiKey = "94989dc9e0mshdf133670c544da3p179ef5jsn9eb22d2fbde5";

  const getToken = async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
      },
    });

    const data = await response.json();
    setShowLink(true);
    return data.access_token;
  };

  const handleSearch = async () => {
    try {
      let spotifyLink = "";
      let youtubeLink = "";
      let deezerLink = "";
  
      if (searchQuery.includes("spotify.com")) {
        spotifyLink = searchQuery;
      } else {
        const spotifyAccessToken = await getToken();
        const responseSpotify = await fetch(
          `https://api.spotify.com/v1/search?q=${searchQuery}&type=track`,
          {
            headers: {
              Authorization: `Bearer ${spotifyAccessToken}`,
            },
          }
        );
        const dataSpotify = await responseSpotify.json();
  
        if (dataSpotify.tracks?.items?.length > 0) {
          spotifyLink = dataSpotify.tracks.items[0].external_urls.spotify;
        }
      }
  
      const youtubeAccessToken = youtubeApi;
      const responseYoutube = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${youtubeAccessToken}&part=snippet&q=${searchQuery}&type=video&maxResults=1`
      );
      const dataYoutube = await responseYoutube.json();
  
      if (dataYoutube?.items?.length > 0) {
        youtubeLink = `https://www.youtube.com/watch?v=${dataYoutube.items[0].id.videoId}`;
      }
  
      const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${searchQuery}`;
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": deezerApiKey,
          "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
        },
      };
  
      try {
        const response = await fetch(url, options);
        const data = await response.json();
  
        if (data.data && data.data.length > 0) {
          deezerLink = data.data[0].link;
          const deezerSearchResults = data.data.map((item) => ({
            id: item.id,
            title: item.title,
            album: item.album.title,
            artist: item.artist.name,
            cover: item.album.cover_medium,
            link: item.link,
          }));
  
          setSearchResults((prevResults) => [
            ...prevResults.filter((result) => result.type !== "deezer"),
            { type: "deezer", data: deezerSearchResults },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
  
      const generatedSmartLink = {
        spotify: spotifyLink,
        youtube: youtubeLink,
        deezer: deezerLink,
      };
      setSmartLink(generatedSmartLink);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };
  
  const handleChange = async (e) => {
    try {
      const { value } = e.target;
      setSearchQuery(value);
      if (value.trim() !== "") {
        const spotifyAccessToken = await getToken();
        const responseSpotify = await fetch(
          `https://api.spotify.com/v1/search?q=${value}&type=track`,
          {
            headers: {
              Authorization: `Bearer ${spotifyAccessToken}`,
            },
          }
        );
        const dataSpotify = await responseSpotify.json();

        if (dataSpotify.tracks.items.length > 0) {
          setSearchResults((prevResults) => [
            { type: "spotify", data: dataSpotify.tracks.items },
            ...prevResults.filter((result) => result.type !== "spotify"),
          ]);
          setShowSearchResults(true);
        }

        const responseYoutube = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${youtubeApi}&part=snippet&q=${value}&type=video&maxResults=5`
        );
        const dataYoutube = await responseYoutube.json();
        const youtubeSearchResults = dataYoutube.items.map((item) => ({
          type: "youtube",
          data: {
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
          },
        }));

        setSearchResults((prevResults) => [
          ...prevResults.filter((result) => result.type !== "youtube"),
          ...youtubeSearchResults,
        ]);

        const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${searchQuery}`;
        const options = {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": deezerApiKey,
            "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
          },
        };
      
        try {
          const response = await fetch(url, options);
          const data = await response.json();
      
          if (data.data && data.data.length > 0) {
            const deezerSearchResults = data.data.map((item) => ({
              id: item.id,
              title: item.title,
              album: item.album.title,
              artist: item.artist.name,
              cover: item.album.cover_medium,
              link: item.link,
            }));
      
            setSearchResults((prevResults) => [
              ...prevResults.filter((result) => result.type !== "deezer"),
              { type: "deezer", data: deezerSearchResults },
            ]);
          }
        } catch (error) {
          console.error(error);
        }

 

        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
  };
  
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
  };
console.log(smartLink)
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-b from-green-500 to-orange-400">
      <div className="w-[700px] bg-green-500 overflow-hidden h-[700px] rounded-tl-none rounded-tr-none rounded-2xl p-5">
        <h1 className="my-5 text-4xl font-bold text-center">
          Smart Link Generator
        </h1>
        <div className="relative flex justify-between w-full h-12">
          <input
            className="w-[85%] h-full px-3 focus:border-none focus:outline-none"
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Enter artist, song, album, or Spotify URL"
          />
          <button
            className="w-[15%] border hover:bg-gray-700 hover:text-white transition-all duration-500 ease-in-out bg-white text-gray-700 h-full"
            onClick={handleSearch}
          >
            Search
          </button>

          {showSearchResults && (
            <div className="absolute overflow-y-auto top-[48px] shadow-md bg-white w-full max-h-[500px] border-2 p-3">
              <div className="w-full h-full overflow-hidden">
                <ul className="flex flex-col gap-y-4">
                  {searchResults.map((resultGroup) =>
                    resultGroup.data.map((result) => (
                      <li
                        key={result.id}
                        className="py-2 border-b"
                        onClick={() => {
                          if (resultGroup.type === "spotify") {
                            setSearchQuery(result.name);
                          } else if (resultGroup.type === "youtube") {
                            setSearchQuery(result.title);
                          } else if (resultGroup.type === "deezer") {
                            setSearchQuery(result.title);
                          }
                          setShowSearchResults(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {resultGroup.type === "spotify" && result.album && (
                          <img
                            className="rounded-md"
                            src={result.album.images[0].url}
                            alt={result.name}
                            width="30"
                            height="30"
                          />
                        )}
                        {resultGroup.type === "youtube" && (
                          <img
                            className="rounded-md"
                            src={result.thumbnail}
                            alt={result.title}
                            width="30"
                            height="30"
                          />
                        )}
                        {resultGroup.type === "deezer" && (
                          <img
                            className="rounded-md"
                            src={result.album.cover}
                            alt={result.title}
                            width="30"
                            height="30"
                          />
                        )}
                        <p>
                          {resultGroup.type === "spotify"
                            ? result.name
                            : resultGroup.type === "youtube"
                            ? result.title
                            : result.title}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {showLink && (
          <div className="p-4 ">
            <p className="py-1 my-3 text-lg font-bold text-white border-b">
              Generated Smart Links:
            </p>
            {Object.keys(smartLink).map((type) => (
              smartLink[type] && (
                <div key={type} className={`flex items-center justify-between w-full h-12 pl-3 mb-3 bg-white border shadow-2xl`}>
                  <a
                    className="inline-block truncate"
                    href={smartLink[type]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={`px-4 py-2 font-bold text-${type === 'spotify' ? 'green' : type === 'youtube' ? 'red' : 'blue'}-500`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}:
                    </span>
                    {smartLink[type]}
                  </a>
                  <button
                    className={`flex items-center justify-center h-full px-2 font-bold bg-${type === 'spotify' ? 'green' : type === 'youtube' ? 'red' : 'blue'}-500 hover:text-white`}
                    onClick={() => handleCopyLink(smartLink[type])}
                  >
                    Copy
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
