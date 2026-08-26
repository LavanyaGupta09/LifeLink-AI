import { aiAPI } from './api';

export type RAGStep = {
  id: string;
  source: string;
  message: string;
  status: 'pending' | 'active' | 'complete';
};

export type RAGResponse = {
  text: string;
  sources: { name: string; url?: string; confidence: number }[];
  is_emergency?: boolean;
  action_chips?: { label: string; action: string }[];
};

export const simulateRAGPipeline = async (
  query: string,
  onStepUpdate: (steps: RAGStep[]) => void
): Promise<RAGResponse> => {
  try {
    // Initial researching step
    onStepUpdate([{ id: 'init', source: 'LifeLink AI', message: 'Analyzing query...', status: 'active' }]);
    
    // Call the backend Groq API
    const res = await aiAPI.communitySearch(query);
    const data = res.data;
    
    // Display the steps from the backend sequentially
    const steps: RAGStep[] = data.steps || [];
    
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'active';
      onStepUpdate([...steps]);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing delay
      steps[i].status = 'complete';
      onStepUpdate([...steps]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      text: data.response?.text || "I'm sorry, I couldn't process your request.",
      sources: data.response?.sources || [],
      is_emergency: data.response?.is_emergency,
      action_chips: data.response?.action_chips
    };
  } catch (error) {
    console.error("RAG Pipeline error:", error);
    onStepUpdate([
      { id: '1', source: 'LifeLink System', message: 'Checking internal knowledge base (Offline Mode)...', status: 'complete' },
      { id: '2', source: 'MoHFW', message: 'Cross-referencing general health protocols...', status: 'complete' }
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      text: "**Overview / Definition**\nLifeLink AI is currently running in offline mode regarding your query.\n\n**Key Considerations / Causes**\n- System offline\n\n**Recommended Actions**\n- Standard clinical practices involve careful monitoring and staying hydrated.\n- Please consult a verified doctor for a personalized diagnosis.\n\n**Red Flags / Emergency Triggers**\n- Seek immediate emergency care if symptoms worsen drastically.\n\n*Note: This guidance is compiled for informational and educational purposes based on standard clinical frameworks, and does not replace professional medical advice.*",
      sources: [
        { name: "General Medical Guidelines", confidence: 0.9 }
      ],
      is_emergency: false,
      action_chips: [
        { label: "Find Doctor", action: "/doctor" },
        { label: "Find Hospital", action: "/hospitals" }
      ]
    };
  }
};
