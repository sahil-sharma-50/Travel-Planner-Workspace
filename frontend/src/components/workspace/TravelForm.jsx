import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Calendar, MapPin, Sparkles } from 'lucide-react';

const SelectionPanel = ({ finalResponse, isProcessing }) => {
    const [selections, setSelections] = useState({
        attractions: [],
        shows: []
    });
    const [recommendations, setRecommendations] = useState(null);
    const [generatedPlan, setGeneratedPlan] = useState('');

    // Parse agent response to extract recommendations
    useEffect(() => {
        if (finalResponse) {
            // Extract attractions and shows from the response
            const parsed = parseRecommendations(finalResponse);
            setRecommendations(parsed);
            setSelections({ attractions: [], shows: [] });
            setGeneratedPlan('');
        }
    }, [finalResponse]);

    const parseRecommendations = (response) => {
        // Simple parsing - look for attractions and shows in the response
        // This is a basic implementation - you might want to enhance this
        const attractions = [];
        const shows = [];

        // Extract attraction names (looking for common patterns)
        const attractionPatterns = [
            /(?:visit|see|explore)\s+([A-Z][^.,\n]+(?:Museum|Tower|Park|Cathedral|Stadium|Temple|Garden|Quarter)[^.,\n]*)/gi,
            /([A-Z][^.,\n]+(?:Museum|Tower|Park|Cathedral|Stadium|Temple|Garden|Quarter))/g
        ];

        const showPatterns = [
            /(?:watch|attend|see)\s+([A-Z][^.,\n]+)/gi,
            /([A-Z][^.,\n]+(?:Theatre|Opera|Musical|Show|Wrestling|FC))/g
        ];

        attractionPatterns.forEach(pattern => {
            const matches = response.matchAll(pattern);
            for (const match of matches) {
                const name = match[1].trim();
                if (name.length > 3 && !attractions.some(a => a.name === name)) {
                    attractions.push({ name, selected: false });
                }
            }
        });

        showPatterns.forEach(pattern => {
            const matches = response.matchAll(pattern);
            for (const match of matches) {
                const name = match[1].trim();
                if (name.length > 3 && !shows.some(s => s.name === name)) {
                    shows.push({ name, selected: false });
                }
            }
        });

        return { attractions: attractions.slice(0, 5), shows: shows.slice(0, 5) };
    };

    const toggleSelection = (type, name) => {
        setSelections(prev => ({
            ...prev,
            [type]: prev[type].includes(name)
                ? prev[type].filter(n => n !== name)
                : [...prev[type], name]
        }));
    };

    const generatePlan = () => {
        if (selections.attractions.length === 0 && selections.shows.length === 0) {
            setGeneratedPlan('Please select at least one attraction or show to generate a plan.');
            return;
        }

        let plan = '📋 Your Personalized Itinerary\n\n';

        if (selections.attractions.length > 0) {
            plan += '🏛️ Attractions to Visit:\n';
            selections.attractions.forEach((attraction, idx) => {
                plan += `${idx + 1}. ${attraction}\n`;
            });
            plan += '\n';
        }

        if (selections.shows.length > 0) {
            plan += '🎭 Shows to Attend:\n';
            selections.shows.forEach((show, idx) => {
                plan += `${idx + 1}. ${show}\n`;
            });
            plan += '\n';
        }

        plan += '✨ This plan has been customized based on your selections!';
        setGeneratedPlan(plan);
    };

    if (isProcessing) {
        return (
            <div className="selection-panel">
                <div className="panel-header">
                    <Sparkles size={20} />
                    <h2>Recommendations</h2>
                </div>
                <div className="panel-content">
                    <div className="empty-state">
                        <p>Waiting for agent recommendations...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!recommendations || (recommendations.attractions.length === 0 && recommendations.shows.length === 0)) {
        return (
            <div className="selection-panel">
                <div className="panel-header">
                    <Sparkles size={20} />
                    <h2>Recommendations</h2>
                </div>
                <div className="panel-content">
                    <div className="empty-state">
                        <p>Ask the agent for travel recommendations to get started!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="selection-panel">
            <div className="panel-header">
                <Sparkles size={20} />
                <h2>Select Your Preferences</h2>
            </div>

            <div className="panel-content">
                {recommendations.attractions.length > 0 && (
                    <div className="selection-section">
                        <h3>
                            <MapPin size={16} />
                            Attractions
                        </h3>
                        <div className="selection-list">
                            {recommendations.attractions.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="selection-item"
                                    onClick={() => toggleSelection('attractions', item.name)}
                                >
                                    {selections.attractions.includes(item.name) ? (
                                        <CheckSquare size={18} className="checkbox checked" />
                                    ) : (
                                        <Square size={18} className="checkbox" />
                                    )}
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {recommendations.shows.length > 0 && (
                    <div className="selection-section">
                        <h3>
                            <Calendar size={16} />
                            Shows & Events
                        </h3>
                        <div className="selection-list">
                            {recommendations.shows.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="selection-item"
                                    onClick={() => toggleSelection('shows', item.name)}
                                >
                                    {selections.shows.includes(item.name) ? (
                                        <CheckSquare size={18} className="checkbox checked" />
                                    ) : (
                                        <Square size={18} className="checkbox" />
                                    )}
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    className="generate-plan-btn"
                    onClick={generatePlan}
                    disabled={selections.attractions.length === 0 && selections.shows.length === 0}
                >
                    Generate My Plan
                </button>

                {generatedPlan && (
                    <div className="generated-plan">
                        <h3>Your Plan</h3>
                        <pre>{generatedPlan}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectionPanel;
