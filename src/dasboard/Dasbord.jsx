import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import './Dasboard.css'; 
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

// We need to register the Chart.js components we are going to use
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- IMPORTANT ---
// Paste your Alpha Vantage API Key here.
const API_KEY = 'CJLOX6T5RDVQGZ26';

// --- Helper Components ---

const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

// MODIFIED: Added borderColor prop and changed text colors to white
const InfoCard = ({ title, value, change, isPositive, isCurrency = true, borderColor = 'border-secondary' }) => {
    const textColor = isPositive === undefined ? 'text-white' : isPositive ? 'text-success' : 'text-danger';
    const changeSymbol = isPositive === undefined ? '' : isPositive ? '▲' : '▼';
    const formattedValue = isCurrency && !isNaN(parseFloat(value)) ? `₹${parseFloat(value).toLocaleString('en-IN')}` : value;

    return (
        <div className={`card bg-black ${borderColor} border-2 h-100 shadow-sm`}>
            <div className="card-body d-flex flex-column justify-content-between">
                <div>
                    {/* MODIFIED: Changed text color to white */}
                    <p className="card-subtitle mb-1 small text-white">{title}</p>
                    {/* MODIFIED: Changed text color to white */}
                    <p className="card-title h4 fw-bold text-white">{formattedValue}</p>
                </div>
                {change !== undefined && (
                    <p className={`fw-semibold mt-1 mb-0 ${textColor}`}>
                        {changeSymbol} {change}
                    </p>
                )}
            </div>
        </div>
    );
};


const StockChart = ({ chartData }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(33, 37, 41, 0.9)', 
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 6,
            },
        },
        scales: {
            x: {
                ticks: { color: '#adb5bd', maxRotation: 0, autoSkip: true, maxTicksLimit: 7 },
                grid: { color: 'rgba(108, 117, 125, 0.3)' },
            },
            y: {
                position: 'right',
                ticks: { color: '#adb5bd', callback: (value) => `₹${value.toFixed(2)}` },
                grid: { color: 'rgba(108, 117, 125, 0.5)' },
            },
        },
    };

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Price',
                data: chartData.data,
                borderColor: 'rgb(56, 189, 248)',
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
                    gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
                    return gradient;
                },
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
                fill: true,
            },
        ],
    };

    return (
        <div className="card bg-black border-secondary p-3 p-sm-4 shadow-lg chart-container">
            <Line options={options} data={data} />
        </div>
    );
};


// --- Main App Component ---

function App() {
    // --- State and logic are unchanged ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [stockQuote, setStockQuote] = useState(null);
    const [stockChartData, setStockChartData] = useState({ labels: [], data: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // All fetch and handler logic remains the same...
    const fetchSearchResults = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        setSearchResults([]);
        try {
            if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
                throw new Error("Please add your API key in the component file");
            }
            const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`);
            const data = await response.json();
            if (data.Note) {
                throw new Error("API call limit reached. Please wait and try again.");
            }
            if (data.Information) {
                throw new Error(data.Information);
            }
            const indianStocks = data.bestMatches?.filter(stock =>
                stock['4. region'] === 'India/Bombay'
            ) || [];

            if (indianStocks.length === 0) {
                setError({ message: `No Indian stocks found for "${query}".` });
            }
            setSearchResults(indianStocks);
        } catch (err)
 {
            setError({ message: err.message });
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            fetchSearchResults(searchQuery);
        }
    };

    const fetchStockDetails = async (symbol) => {
        setIsLoading(true);
        setError(null);
        setStockQuote(null);
        setStockChartData({ labels: [], data: [] });

        try {
            const [quoteRes, seriesRes] = await Promise.all([
                fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`),
                fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}`)
            ]);

            const quoteData = await quoteRes.json();
            const seriesData = await seriesRes.json();

            if (quoteData.Note || seriesData.Note) {
                throw new Error("API call limit reached. Please wait and try again.");
            }
            if (quoteData['Error Message'] || seriesData['Error Message']) {
                throw new Error("Invalid stock symbol or API error.");
            }
            if (!quoteData['Global Quote'] || !quoteData['Global Quote']['01. symbol']) {
                throw new Error("No quote data found for this symbol. It might be delisted or invalid.");
            }

            setStockQuote(quoteData['Global Quote']);

            const timeSeries = seriesData['Time Series (Daily)'];
            if (timeSeries) {
                const labels = Object.keys(timeSeries).slice(0, 90).reverse();
                const dataPoints = labels.map(label => parseFloat(timeSeries[label]['4. close']));
                setStockChartData({ labels, data: dataPoints });
            }

        } catch (err) {
            setError({ message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectStock = (stock) => {
        const symbol = stock['1. symbol'];
        setSelectedStock(stock);
        setSearchQuery('');
        setSearchResults([]);
        fetchStockDetails(symbol);
    };

    const clearSelection = () => {
        setSelectedStock(null);
        setStockQuote(null);
        setStockChartData({ labels: [], data: [] });
        setError(null);
    };

    const quoteDetails = useMemo(() => {
        if (!stockQuote) return null;
        const change = parseFloat(stockQuote['09. change']);
        const changePercent = parseFloat(stockQuote['10. change percent']?.replace('%', ''));
        const isPositive = change >= 0;

        return {
            symbol: stockQuote['01. symbol'],
            price: stockQuote['05. price'],
            change: change.toFixed(2),
            changePercent: `${changePercent.toFixed(2)}%`,
            isPositive: isPositive,
            open: stockQuote['02. open'],
            high: stockQuote['03. high'],
            low: stockQuote['04. low'],
            volume: parseInt(stockQuote['06. volume']).toLocaleString('en-IN'),
            prevClose: stockQuote['08. previous close'],
        }
    }, [stockQuote]);


    return (
        <div className="bg-black text-light min-vh-100">
            <main className="container py-4 py-md-5">
                <header className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-5">
                    <div className='vishwa'>
                        <h1 className="display-5 fw-bold text-info mb-4 text-center">
                         Indian Stock Market
                        </h1>

                    </div>
                    {selectedStock && (
                        <button
                            onClick={clearSelection}
                            className="btn btn-outline-light d-flex align-items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search me-2" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                            Search New Stock
                        </button>
                    )}
                </header>

                {!selectedStock ? (
                    <div className="col-md-10 col-lg-8 mx-auto">
                        <div className="position-relative">
                            <input
                                type="text"
                                placeholder="Search for a stock and press Enter..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="form-control form-control-lg bg-black text-light border-secondary p-3"
                                style={{'--bs-focus-ring-color': 'rgba(var(--bs-info-rgb), .25)'}}
                            />
                        </div>
                        {isLoading && <LoadingSpinner />}
                        {error && <div className="alert alert-danger mt-4 text-center">{error.message}</div>}
                        <div className="mt-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="list-group">
                                {searchResults.map((stock) => (
                                    <button
                                        key={stock['1. symbol']}
                                        onClick={() => handleSelectStock(stock)}
                                        className="list-group-item list-group-item-action list-group-item-black bg-black d-flex justify-content-between align-items-center p-3"
                                    >
                                        <div className="text-start">
                                            <p className="fw-bold text-light mb-0">{stock['1. symbol']}</p>
                                            <p className="small text-muted mb-0 text-truncate" style={{maxWidth: '300px'}}>
                                                {stock['2. name']}
                                            </p>
                                        </div>
                                        <span className="badge bg-secondary rounded-pill">{stock['8. currency']}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-5 text-centertext-sm-start  text-danger">  
                            <h2 className="display-4 fw-bold text-danger">{selectedStock['1. symbol']}</h2>
                            <p className="fs-5 text-light">{selectedStock['2. name']}</p>
                        </div>

                        {isLoading && <LoadingSpinner />}
                        {error && <div className="alert alert-danger mb-4 text-center">{error.message}</div>}
                        
                        {quoteDetails && (
                            <>
                                <div className="row g-4 mb-5">
                                    <div className="col-6 col-md-4 col-lg">
                                        {/* MODIFIED: Applied red border to all cards */}
                                        <InfoCard title="Current Price" value={quoteDetails.price} change={quoteDetails.change} isPositive={quoteDetails.isPositive} borderColor="border-danger" />
                                    </div>
                                    <div className="col-6 col-md-4 col-lg">
                                        <InfoCard title="Change %" value={quoteDetails.changePercent} isPositive={quoteDetails.isPositive} isCurrency={false} borderColor="border-danger" />
                                    </div>
                                     <div className="col-6 col-md-4 col-lg">
                                        <InfoCard title="Day's High" value={quoteDetails.high} borderColor="border-danger" />
                                    </div>
                                     <div className="col-6 col-md-4 col-lg">
                                        <InfoCard title="Day's Low" value={quoteDetails.low} borderColor="border-danger" />
                                    </div>
                                     <div className="col-12 col-md-4 col-lg">
                                        <InfoCard title="Volume" value={quoteDetails.volume} isCurrency={false} borderColor="border-danger" />
                                    </div>
                                </div>
                                {stockChartData.labels.length > 0 && <StockChart chartData={stockChartData} />}
                            </>
                        )}
                    </div>
                )}
                
            </main>
        </div>
    );
}

export default App;