import React from 'react';
import { Calendar, MapPin, CheckSquare, Square } from 'lucide-react';

/**
 * TravelPrepForm provides a sidebar UI for users to manually manage 
 * their travel details like destination, dates, and a preparation checklist.
 * These values can also be automatically updated by the agent via 'client_action' events.
 */
const TravelPrepForm = ({ formData, onFormChange }) => {
    // List of cities supported by the mock backend/recommendation logic
    const cities = ['New York', 'Paris', 'London', 'Tokyo', 'Barcelona', 'Berlin', 'Rome', 'Sydney', 'Dubai', 'Mumbai', 'Toronto'];

    // Checklist items for trip preparation
    const checklistItems = [
        { id: 'passport', label: 'Passport' },
        { id: 'visa', label: 'Visa' },
        { id: 'tickets', label: 'Flight Tickets' },
        { id: 'hotel', label: 'Hotel Booking' },
        { id: 'luggage', label: 'Luggage Packed' },
        { id: 'insurance', label: 'Travel Insurance' },
        { id: 'currency', label: 'Local Currency' },
        { id: 'medications', label: 'Medications' }
    ];

    /**
     * Updates the destination city in the parent state.
     */
    const handleCityChange = (e) => {
        onFormChange({ ...formData, city: e.target.value });
    };

    /**
     * Updates the start date of the trip.
     */
    const handleStartDateChange = (e) => {
        onFormChange({ ...formData, startDate: e.target.value });
    };

    /**
     * Updates the end date of the trip.
     */
    const handleEndDateChange = (e) => {
        onFormChange({ ...formData, endDate: e.target.value });
    };

    /**
     * Toggles a checklist item's status (checked/unchecked).
     * @param {string} itemId - The ID of the checklist item (e.g., 'passport').
     */
    const handleChecklistToggle = (itemId) => {
        const newChecklist = { ...formData.checklist };
        newChecklist[itemId] = !newChecklist[itemId];
        onFormChange({ ...formData, checklist: newChecklist });
    };

    return (
        <div className="travel-prep-form">
            <div className="form-header">
                <h2>🧳 Travel Preparation</h2>
            </div>

            <div className="form-content">
                <div className="form-section">
                    <label>
                        <MapPin size={16} />
                        <span>Destination</span>
                    </label>
                    <select
                        value={formData?.city || ''}
                        onChange={handleCityChange}
                        className="form-select"
                    >
                        <option value="">Select city...</option>
                        {cities.map(city => (
                            <option key={city} value={city.toLowerCase()}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="form-section">
                    <label>
                        <Calendar size={16} />
                        <span>Travel Dates</span>
                    </label>
                    <div className="date-range">
                        <input
                            type="date"
                            value={formData?.startDate || ''}
                            onChange={handleStartDateChange}
                            className="form-input"
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            value={formData?.endDate || ''}
                            onChange={handleEndDateChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <label>
                        <CheckSquare size={16} />
                        <span>Preparation Checklist</span>
                    </label>
                    <div className="checklist">
                        {checklistItems.map(item => (
                            <div
                                key={item.id}
                                className="checklist-item"
                                onClick={() => handleChecklistToggle(item.id)}
                            >
                                {formData?.checklist?.[item.id] ? (
                                    <CheckSquare size={18} className="checkbox-checked" />
                                ) : (
                                    <Square size={18} className="checkbox-unchecked" />
                                )}
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelPrepForm;
