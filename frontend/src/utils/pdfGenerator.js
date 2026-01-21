import { jsPDF } from 'jspdf';

/**
 * Generates a PDF itinerary for the user.
 * 
 * @param {Object} data - The data needed for the PDF.
 * @param {string} data.personalizedPlan - The generated plan text.
 * @param {string} data.finalResponse - Fallback plan text.
 * @param {Object} data.travelFormData - Checklist data.
 */
export const downloadPlanAsPDF = ({ personalizedPlan, finalResponse, travelFormData }) => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text("Travel Itinerary", margin, yPosition);
    yPosition += 15;

    // Add Preparation Checklist
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Preparation Checklist", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

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

    checklistItems.forEach(item => {
        const isChecked = travelFormData?.checklist?.[item.id];
        const symbolColor = isChecked ? [16, 185, 129] : [239, 68, 68]; // Green or Red

        doc.setTextColor(...symbolColor);
        doc.setFont(undefined, 'bold');
        doc.text(isChecked ? '[X]' : '[ ]', margin, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text(item.label, margin + 10, yPosition);
        yPosition += 6;
    });

    yPosition += 10;

    // Add a line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Process and format the plan content
    const planText = personalizedPlan || finalResponse || "";
    const lines = planText.split('\n');

    lines.forEach(line => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }

        if (line.startsWith('####')) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            const text = line.replace(/^####\s*/, '');
            const splitText = doc.splitTextToSize(text, maxWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 6 + 4;
        } else if (line.startsWith('###')) {
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            const text = line.replace(/^###\s*/, '');
            const splitText = doc.splitTextToSize(text, maxWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 7 + 5;
        } else if (line.startsWith('##')) {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            const text = line.replace(/^##\s*/, '');
            const splitText = doc.splitTextToSize(text, maxWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 8 + 6;
        } else if (line.startsWith('- **') || line.startsWith('* **')) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            const text = line.replace(/^[-*]\s*\*\*(.*?)\*\*/, '• $1');
            const splitText = doc.splitTextToSize(text, maxWidth - 5);
            doc.text(splitText, margin + 5, yPosition);
            yPosition += splitText.length * 5 + 2;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            const text = line.replace(/^[-*]\s*/, '• ');
            const splitText = doc.splitTextToSize(text, maxWidth - 5);
            doc.text(splitText, margin + 5, yPosition);
            yPosition += splitText.length * 5 + 2;
        } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            const text = line.replace(/\*\*/g, '');
            const splitText = doc.splitTextToSize(text, maxWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 5 + 3;
        } else if (line.trim() !== '') {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            const splitText = doc.splitTextToSize(line, maxWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 5 + 2;
        } else {
            yPosition += 4;
        }
    });

    doc.save(`travel_itinerary_${Date.now()}.pdf`);
};
