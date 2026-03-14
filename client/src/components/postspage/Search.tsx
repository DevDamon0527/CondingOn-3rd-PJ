import '../../styles/PostSearch.scss'
import '../../styles/Font.scss';

function Search() {
    return(
        <>
            <div className='search-container'>
                <div className='searchbar'>
                    <input className='searchbar-input' type="text" placeholder='검색어를 입력하세요...' />
                </div>
                <button className="search-button">검색</button>
            </div>
        </>
    )
}

export default Search;