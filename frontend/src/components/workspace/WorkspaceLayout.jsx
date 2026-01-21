/**
 * WorkspaceLayout is the main container component for the Travel Planner application.
 * It manages the global state including conversation history, current query, 
 * agent execution traces, and travel form data.
 */
const WorkspaceLayout = () => {
    // --- State Management ---
    const [query, setQuery] = useState('');
    const [steps, setSteps] = useState([
        'Analyze request',
        'Fetch weather data',
        'Get tourist attractions',
        'Find current shows',
        'Generate recommendation'
    ]);
    const [currentStep, setCurrentStep] = useState(0);
    const [traces, setTraces] = useState([]);
    const [finalResponse, setFinalResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [userPreferences, setUserPreferences] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [plan, setPlan] = useState('');
    const [structuredData, setStructuredData] = useState(null);
    const [isProcessingPlan, setIsProcessingPlan] = useState(false);
    const [travelFormData, setTravelFormData] = useState({
        city: '',
        startDate: '',
        endDate: '',
        checklist: {}
    });
    const [personalizedPlan, setPersonalizedPlan] = useState(null);

    const handleFormChange = (newFormData) => {
        setTravelFormData(newFormData);
    };

    const [conversationHistory, setConversationHistory] = useState([]);

    // --- Initialization Effects ---

    // Generate a unique session ID once when the app starts
    React.useEffect(() => {
        const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        setSessionId(id);
    }, []);

    // Load static user preferences and interests from the backend
    React.useEffect(() => {
        fetch('http://127.0.0.1:8000/api/v1/knowledge')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUserPreferences({
                        name: data.user.name,
                        interests: data.user.preferences.interests,
                        description: data.user.preferences.description
                    });
                }
            })
            .catch(err => console.error('Failed to load preferences:', err));
    }, []);

    /**
     * Handles the submission of a new user query.
     * Communicates with the backend using a streaming NDJSON response.
     */
    const handleSubmit = async (userQuery) => {
        setQuery(userQuery);
        setCurrentStep(0);
        setTraces([]);
        setFinalResponse('');
        setPlan('');
        setIsProcessing(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/plan_tour', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userQuery, session_id: sessionId }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botText = "";
            let stepIndex = 0;
            let lineBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                lineBuffer += decoder.decode(value, { stream: true });
                const lines = lineBuffer.split("\n");
                lineBuffer = lines.pop(); // Keep the last partial line

                for (const line of lines) {
                    if (line.trim() === "") continue;
                    try {
                        const event = JSON.parse(line);
                        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                        if (event.type === "plan") {
                            setPlan(event.content);
                        } else if (event.type === "status") {
                            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
                            setTraces(prev => [...prev, {
                                type: 'status',
                                label: event.content,
                                reason: event.reason || '',
                                status: event.status || '',
                                timestamp,
                            }]);
                        } else if (event.type === "structured_data") {
                            setStructuredData(event.content);
                        } else if (event.type === "client_action") {
                            // Handle client-side actions from agent
                            if (event.action === "enable_download") {
                                // Store download data for later use
                                window.travelDownloadData = event.data;
                            } else if (event.action === "update_travel_form") {
                                // Update travel preparation form with merging
                                setTravelFormData(prev => {
                                    const newData = { ...event.data };
                                    // Deep merge checklist if both exist
                                    const mergedChecklist = {
                                        ...(prev.checklist || {}),
                                        ...(newData.checklist || {})
                                    };

                                    return {
                                        ...prev,
                                        ...Object.fromEntries(
                                            Object.entries(newData).filter(([_, v]) => v !== "" && (typeof v !== 'object' || Object.keys(v).length > 0))
                                        ),
                                        checklist: mergedChecklist
                                    };
                                });
                            }
                        } else if (event.type === "result") {
                            botText += event.content;
                            setCurrentStep(steps.length);
                        }
                    } catch (e) {
                        console.error("Error parsing line:", line, e);
                    }
                }
            }

            setFinalResponse(botText);

        } catch (error) {
            console.error("Error:", error);
            setFinalResponse("Sorry, I'm having trouble connecting to the server. Is it running?");
        } finally {
            setIsProcessing(false);
            setPersonalizedPlan(null); // Clear personalized plan when a new main query starts

            // Save conversation to history (skip during silent plan generation)
            if (query && finalResponse && !isProcessingPlan) {
                setConversationHistory(prev => [
                    ...prev,
                    { role: 'user', content: query, timestamp: new Date().toLocaleTimeString() },
                    { role: 'agent', content: finalResponse, timestamp: new Date().toLocaleTimeString() }
                ]);
            }
        }
    };

    const handlePlanRequest = async (selections) => {
        const attractions = selections.attractions.join(', ');
        const shows = selections.shows.join(', ');
        const startDate = travelFormData.startDate || 'Unspecified';
        const endDate = travelFormData.endDate || 'Unspecified';
        const city = travelFormData.city || 'current destination';

        // Process checklist
        const docLabels = {
            passport: 'Passport',
            visa: 'Visa',
            tickets: 'Flight Tickets',
            hotel: 'Hotel Booking',
            luggage: 'Luggage Packed',
            insurance: 'Travel Insurance',
            currency: 'Local Currency',
            medications: 'Medications'
        };

        const haveDocs = [];
        const needDocs = [];

        if (travelFormData.checklist) {
            Object.entries(travelFormData.checklist).forEach(([key, value]) => {
                const label = docLabels[key] || key;
                if (value) haveDocs.push(label);
                else needDocs.push(label);
            });
        }

        const docStatus = `Document Status - Have: ${haveDocs.join(', ') || 'None'}. Need: ${needDocs.join(', ') || 'None'}.`;

        const planQuery = `I have selected the following attractions: ${attractions} and shows: ${shows}. ` +
            `My travel dates are from ${startDate} to ${endDate} in ${city}. ` +
            `${docStatus} ` +
            `Please generate a detailed daily itinerary for my trip based on these selections. ` +
            `If I haven't set my travel dates, please ask me for them. ` +
            `Also, explicitly mention which documents I have and which I still need to prepare in a narrative way (e.g. "You have your Passport ready..."). ` +
            `Do NOT use tick (✓) or cross (✗) symbols in the document section.`;

        // Generate plan silently without updating main conversation UI
        setIsProcessingPlan(true);
        setPersonalizedPlan(null); // Clear previous personalized plan

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/plan_tour', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: planQuery, session_id: sessionId, is_planning_only: true }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let planText = "";
            let lineBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                lineBuffer += decoder.decode(value, { stream: true });
                const lines = lineBuffer.split("\n");
                lineBuffer = lines.pop();

                for (const line of lines) {
                    if (line.trim() === "") continue;
                    try {
                        const event = JSON.parse(line);
                        if (event.type === "result") {
                            planText += event.content;
                        }
                    } catch (e) {
                        console.error("Error parsing line:", line, e);
                    }
                }
            }

            setPersonalizedPlan(planText);

        } catch (error) {
            console.error("Error:", error);
            setPersonalizedPlan("Error generating your personalized plan. Please try again.");
        } finally {
            setIsProcessingPlan(false);
        }
    };

    return (
        <div className="workspace-layout">
            <div className="workspace-header">
                <h1>Travel Planner Workspace</h1>
            </div>

            <div className="workspace-main">
                <AgentPlanPanel
                    query={query}
                    steps={steps}
                    currentStep={currentStep}
                    userPreferences={userPreferences}
                />

                <ExecutionTracePanel
                    traces={traces}
                    finalResponse={finalResponse}
                    personalizedPlan={personalizedPlan}
                    plan={plan}
                    isProcessing={isProcessing}
                    isProcessingPlan={isProcessingPlan}
                    structuredData={structuredData}
                    userPreferences={userPreferences}
                    conversationHistory={conversationHistory}
                    onPlanRequest={handlePlanRequest}
                    travelFormData={travelFormData}
                />

                <TravelPrepForm
                    formData={travelFormData}
                    onFormChange={handleFormChange}
                />
            </div>

            <WorkspaceInput
                onSubmit={handleSubmit}
                disabled={isProcessing}
            />
        </div>
    );
};

export default WorkspaceLayout;
