import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

/**
 * RecommendationsTable component to display attractions and shows.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the table section.
 * @param {Array} props.items - List of items to display.
 * @param {Array} props.selectedItems - List of currently selected item names.
 * @param {string} props.type - Type of items ('attractions' or 'shows').
 * @param {Function} props.onToggle - Callback for toggling selection.
 */
const RecommendationsTable = ({ title, items, selectedItems, type, onToggle }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="table-section">
            <h4>{title}</h4>
            <table>
                <thead>
                    <tr>
                        <th className="checkbox-col"></th>
                        <th>Name</th>
                        <th>Type</th>
                        {type === 'attractions' ? <th>Rating</th> : <><th>Time</th><th>Price</th></>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} onClick={() => onToggle(type, item.name)}>
                            <td className="checkbox-col">
                                {selectedItems.includes(item.name) ? (
                                    <CheckSquare size={18} className="checkbox-icon checked" />
                                ) : (
                                    <Square size={18} className="checkbox-icon" />
                                )}
                            </td>
                            <td>{item.name}</td>
                            <td className="type-cell">{item.type || '-'}</td>
                            {type === 'attractions' ? (
                                <td className="rating-cell">{item.rating ? `⭐ ${item.rating}` : '-'}</td>
                            ) : (
                                <>
                                    <td className="time-cell">{item.time || '-'}</td>
                                    <td className="price-cell">{item.price ? `$${item.price}` : '-'}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecommendationsTable;
