import { useState, useEffect } from 'react';
import { copy, linkIcon, loader, tick } from '../assets';
import { useLazyGetSummaryQuery } from '../services/article';

const Demo = () => {
    const [article, setArticle] = useState({
        url: '',
        summary: '',
    });
    const [allArticles, setAllArticles] = useState([]);

    const [copied, setCopied] = useState('');

    const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

    useEffect(() => {
        const articlesFromLocalStorage = JSON.parse(localStorage.getItem('articles'));

        if (articlesFromLocalStorage) {
            setAllArticles(articlesFromLocalStorage);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data } = await getSummary({ articleUrl: article.url });

        if (data?.summary) {
            const newArticle = { ...article, summary: data.summary };
            const updatedAllArticles = [newArticle, ...allArticles];

            setArticle(newArticle);
            setAllArticles(updatedAllArticles);

            localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
        }
    };

    const handleCopy = (copyUrl) => {
        setCopied(copyUrl);
        navigator.clipboard.writeText(copyUrl);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleClearHistory = () => {
        // Clear all articles from local storage and reset state
        localStorage.removeItem('articles');
        setAllArticles([]);
    };

    const handleDeleteArticle = (indexToRemove) => {
        const updatedArticles = allArticles.filter((_, index) => index !== indexToRemove);
        setAllArticles(updatedArticles);
        localStorage.setItem('articles', JSON.stringify(updatedArticles));
    };

    return (
        <section className="mt-16 w-full max-w-2xl mx-auto">
            {/* Input Form */}
            <div className="flex flex-col items-center w-full gap-4 mb-8">
                <form
                    className="relative flex justify-center items-center w-full max-w-lg"
                    onSubmit={handleSubmit}
                >
                    <img src={linkIcon} alt="link_icon" className="absolute left-4 w-6 h-6" />
                    <input
                        type="url"
                        placeholder="Enter a URL"
                        value={article.url}
                        onChange={(e) => setArticle({ ...article, url: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="absolute right-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                    >
                        Summarize
                    </button>
                </form>
            </div>

            {/* URL History */}
            <div className="w-full max-w-lg mx-auto mb-8">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">URL History
                {allArticles.length > 0 && (
                        <button
                            className="bg-red-500 text-white px-1 py-1 ml-4 text-sm rounded-md hover:bg-red-600 transition"
                            onClick={handleClearHistory}
                        >
                            Clear History
                        </button>
                    )}
                </h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                    {allArticles.map((item, index) => (
                        <div
                            key={`link-${index}`}
                            onClick={() => setArticle(item)}
                            className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="flex-1 truncate text-blue-600 font-medium">
                                {item.url}
                            </div>
                            <div className="ml-3" onClick={() => handleCopy(item.url)}>
                                <img
                                    src={copied === item.url ? tick : copy}
                                    alt="copy_icon"
                                    className="w-6 h-6"
                                />
                                
                            </div>
                            <button
                                onClick={() => handleDeleteArticle(index)}
                                className="bg-red-400 text-white p-1 ml-4 text-sm rounded-full hover:bg-red-500 transition"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Display Results */}
            <div className="flex justify-center items-center">
                {isFetching ? (
                    <img src={loader} alt="loader" className="w-16 h-16 object-contain animate-spin" />
                ) : error ? (
                    <p className="text-center text-red-600 font-semibold">
                        An error occurred...
                        <br />
                        <span className="text-gray-700">{error?.data?.error}</span>
                    </p>
                ) : (
                    article.summary && (
                        <div className="max-w-lg mx-auto">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                <span className="text-blue-500">Article Summary :</span>
                            </h2>
                            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                                <p className="text-gray-700">{article.summary}</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

export default Demo;
