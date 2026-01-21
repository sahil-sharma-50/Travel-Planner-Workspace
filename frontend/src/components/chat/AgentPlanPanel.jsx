import React from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';

const AgentPlanPanel = ({ query, steps, currentStep, userPreferences }) => {
    return (
        <div className="agent-plan-panel">
            <div className="panel-header">
                <Target size={20} />
                <h2>Agent Plan</h2>
            </div>

            <div className="panel-content">
                {query && (
                    <div className="query-section">
                        <h3>Query</h3>
                        <p className="query-text">{query}</p>
                    </div>
                )}


                {userPreferences && (
                    <div className="knowledge-section">
                        <h3>Knowledge Base</h3>
                        <div className="knowledge-card">
                            <div className="knowledge-item">
                                <span className="knowledge-label">User:</span>
                                <span className="knowledge-value">{userPreferences.name}</span>
                            </div>
                            <div className="knowledge-item">
                                <span className="knowledge-label">Interests:</span>
                                <div className="knowledge-interests">
                                    {userPreferences.interests?.map((interest, idx) => (
                                        <span key={idx} className="interest-badge">{interest}</span>
                                    ))}
                                </div>
                            </div>
                            {userPreferences.description && (
                                <div className="knowledge-item">
                                    <span className="knowledge-label">Description:</span>
                                    <span className="knowledge-value">{userPreferences.description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default AgentPlanPanel;

