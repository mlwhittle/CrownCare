import React from 'react';
import { ArrowLeft, User, TrendingUp, Activity, CheckCircle2, ChevronRight, Leaf } from 'lucide-react';
import './MonthlyGrowthReport.css';

export default function MonthlyGrowthReport({ clientName }) {
    // Hardcoded highly positive metrics to represent a thriving retention cycle 
    // exactly like the marketing screenshot.
    const month = "June 2024";
    const totalGain = "1.68 cm";
    const retentionRate = "96.2%";
    const avgGrowth = "+1.2";

    const chartData = [
        { month: 'Jan', value: 0.9 },
        { month: 'Feb', value: 1.1 },
        { month: 'Mar', value: 1.4 },
        { month: 'Apr', value: 1.3 },
        { month: 'May', value: 1.5 },
        { month: 'June', value: 1.68, isCurrent: true }
    ];

    const maxChartValue = Math.max(...chartData.map(d => d.value));

    return (
        <div className="mgr-container">
            {/* Header */}
            <div className="mgr-header">
                <button className="mgr-back-btn">
                    <ArrowLeft size={18} />
                </button>
                <div className="mgr-title">
                    <h4>MONTHLY GROWTH REPORT</h4>
                    <span>{month}</span>
                </div>
                <div className="mgr-avatar">
                    <User size={18} />
                </div>
            </div>

            {/* Summary Block */}
            <div className="mgr-summary">
                <div className="mgr-summary-title">SUMMARY: <span className="mgr-gain">+{totalGain}</span></div>
                <div className="mgr-metrics-grid">
                    <div className="mgr-metric">
                        <span className="mgr-label">Total Length Gain</span>
                        <strong className="mgr-val">{totalGain}</strong>
                    </div>
                    <div className="mgr-metric">
                        <span className="mgr-label">Retention Rate</span>
                        <strong className="mgr-val">{retentionRate}</strong>
                    </div>
                    <div className="mgr-metric">
                        <span className="mgr-label">Avg. Growth</span>
                        <strong className="mgr-val mgr-gain">{avgGrowth} cm/Mo. ↑</strong>
                    </div>
                </div>
            </div>

            {/* Monthly Growth Overview Bar Chart */}
            <div className="mgr-card">
                <div className="mgr-card-title">Monthly Growth Overview</div>
                <div className="mgr-card-subtitle">Monthly Length Growth</div>
                
                <div className="mgr-bar-chart">
                    {/* Y-Axis Labels */}
                    <div className="mgr-y-axis">
                        <span>2.0cm</span>
                        <span>1.5cm</span>
                        <span>1.0cm</span>
                        <span>0.5cm</span>
                        <span>0.0cm</span>
                    </div>
                    <div className="mgr-bars-container">
                        {chartData.map((data, idx) => {
                            const heightPercent = (data.value / 2.0) * 100;
                            return (
                                <div key={idx} className="mgr-bar-wrapper">
                                    <div className="mgr-bar-value">{data.value}cm</div>
                                    <div 
                                        className={`mgr-bar ${data.isCurrent ? 'mgr-bar-gold' : 'mgr-bar-standard'}`} 
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                    <div className="mgr-x-label">{data.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="mgr-insights-grid">
                <div className="mgr-insight-card">
                    <TrendingUp size={16} className="mgr-insight-icon gold" />
                    <div className="mgr-insight-content">
                        <span className="mgr-label">Hair Retention</span>
                        <strong>96.2%</strong>
                        <span className="mgr-trend up">▲ +0.8%</span>
                    </div>
                </div>
                <div className="mgr-insight-card">
                    <CheckCircle2 size={16} className="mgr-insight-icon gold" />
                    <div className="mgr-insight-content">
                        <span className="mgr-label">Health Score</span>
                        <strong>94%</strong>
                        <span className="mgr-subtext">Optimal</span>
                    </div>
                </div>
                <div className="mgr-insight-card">
                    <Leaf size={16} className="mgr-insight-icon gold" />
                    <div className="mgr-insight-content">
                        <span className="mgr-label">Tip Quality</span>
                        <strong>Strong</strong>
                    </div>
                </div>
            </div>

            {/* Length Retention Track (Line Graph) */}
            <div className="mgr-card mgr-mb-0">
                <div className="mgr-card-title">Length Retention Track</div>
                <div className="mgr-card-subtitle">Monthly Net Gain (cm)</div>
                
                <div className="mgr-line-wrapper">
                   {/* Pure CSS Line Chart using SVG for pixel perfection based on mockup */}
                   <svg width="100%" height="100px" viewBox="0 0 300 100" preserveAspectRatio="none">
                       {/* Grid line */}
                       <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                       
                       {/* Drop Shadow Filter */}
                       <defs>
                           <filter id="glow">
                               <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                               <feMerge>
                                   <feMergeNode in="coloredBlur"/>
                                   <feMergeNode in="SourceGraphic"/>
                               </feMerge>
                           </filter>
                       </defs>

                       {/* The Line */}
                       <polyline 
                           points="10,80 50,75 100,50 150,60 200,40 250,20" 
                           fill="none" 
                           stroke="#D4AF37" 
                           strokeWidth="2.5" 
                           filter="url(#glow)" 
                       />
                       
                       {/* The Data Points */}
                       <circle cx="10" cy="80" r="3" fill="#D4AF37" />
                       <circle cx="50" cy="75" r="3" fill="#D4AF37" />
                       <circle cx="100" cy="50" r="3" fill="#D4AF37" />
                       <circle cx="150" cy="60" r="3" fill="#D4AF37" />
                       <circle cx="200" cy="40" r="3" fill="#D4AF37" />
                       
                       {/* The June Highlight Point */}
                       <circle cx="250" cy="20" r="5" fill="#FFF" stroke="#D4AF37" strokeWidth="2" />
                       
                   </svg>
                   <div className="mgr-line-labels">
                       <span>Jan</span>
                       <span>Feb</span>
                       <span>Mar</span>
                       <span>Apr</span>
                       <span>May</span>
                       <span>June</span>
                   </div>

                   {/* Absolute positioned stats block for June */}
                   <div className="mgr-june-annotation">
                       <span className="mgr-big-gain">1.68 cm</span>
                       <span className="mgr-gain-sub">+0.18 cm vs May</span>
                   </div>
                   <div className="mgr-june-details">
                       <strong>June</strong>
                       <div className="mgr-detail-row"><span>Starting Length:</span> <span>45.2 cm</span></div>
                       <div className="mgr-detail-row"><span>End Length:</span> <span>46.88 cm</span></div>
                       <div className="mgr-detail-row"><span>Overall Gain:</span> <span>1.68 cm</span></div>
                   </div>
                </div>
            </div>

            <div className="mgr-home-indicator"></div>
        </div>
    );
}
