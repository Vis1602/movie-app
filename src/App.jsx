import { useState, useEffect } from 'react'
import Search from './components/Search.jsx'
import Moviecard from './components/Moviecard.jsx'
import { useDebounce } from 'react-use'
import { updateSearchCount , getTrendingMovies} from './appwrite.js'
function App() {
  const [searchTerm, setsearchTerm] = useState("")
  const [errorMessage, seterrorMessage] = useState("")
  const [movieList, setmovieList] = useState([])
  const [trendingMovies, settrendingMovies] = useState([])
  const [isLoading, setisLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm)
  }, 500, [searchTerm])
  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const API_KEY = import.meta.env.VITE_IMDB_API_KEY;
  //console.log(API_KEY);
const API_options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};
const LoadTrendingMovies = async () => {
  try {
    const movies = await getTrendingMovies();
    settrendingMovies(movies);
  } catch (error) {
    console.error(`Error loading trending movies: ${error}`);
  }
}
const fetchMovies = async (query="") => {
  setisLoading(true);
  seterrorMessage("");

  try {
    const endpoint = query? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_options);
    if(!response.ok){
      throw new Error('Error fetching data');
    }
    const data = await response.json();
    console.log(data.results);
    if (data.results.length === 0) {
      seterrorMessage("No movies found for your search.");
      setmovieList([]);
      return;
    }
    setmovieList(data.results);
    if(query && data.results.length>0){
      await updateSearchCount(query,data.results[0]);
    }
  } catch (error) {
    console.error(error);
    seterrorMessage("Error fetching data");
  }
  finally{
    setisLoading(false);
  }
}
useEffect(() => {
  fetchMovies(debouncedSearchTerm);
},[debouncedSearchTerm]);
useEffect(() => {
  LoadTrendingMovies();
},[]);
  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src='/hero.png' alt='hero' />
          <h1>Find <span className='text-gradient'>movies</span> you'll enjoy without the hassle</h1>
          <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm}/>
        </header>
        {trendingMovies.length>0 && (
          <section className='trending'>
            <h2>Trending movies</h2>
            <ul>
              {trendingMovies.map((movie, idx) => (
                <li key={movie.$id}>
                  <p>{idx+1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className='all-movies'>
          <h2>All Movies</h2>
         {isLoading ? (<p className='text-white'>Loading...</p>) : errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) : (
          <ul>
            {movieList.map((movie, idx) => (
              <Moviecard key={idx} movie={movie} />
            ))}
          </ul>
         )}
        </section>
      </div>
    </main>
  )
}

export default App
