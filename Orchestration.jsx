
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ConceptInput from "../components/orchestration/ConceptInput";
import WorkflowPipeline from "../components/orchestration/WorkflowPipeline";
import ResultDisplay from "../components/orchestration/ResultDisplay";

const getPrompts = (modality, concept, isRefinement = false) => {
    const refinementText = isRefinement ? 'This is a refinement request. The previous generation needs improvement based on feedback.' : '';

    switch (modality) {
        case 'audio':
            return {
                planning: `You are an AI audio production planner. Analyze this concept for a short audio piece.
Concept: "${concept}"
${refinementText}
Provide a brief strategy and an enhanced prompt for a voiceover script (style, tone, content points). Output as JSON.`,
                planning_schema: { type: "object", properties: { strategy: { type: "string" }, enhanced_prompt: { type: "string" } } },
                generation_invoke_llm: true, // Flag to indicate using InvokeLLM for generation
                generation_prompt_builder: (prompt) => `Generate a voiceover script based on this prompt: ${prompt}`,
                generation_schema: { type: "object", properties: { script: { type: "string" } } },
                review: (genPrompt) => `You are an AI audio critic. Assess this generated script.
Original Concept: "${concept}"
Enhanced Prompt Used: "${genPrompt}"
Provide a quality score (1-10), assessment, and 2-3 specific suggestions for improvement if needed. Output as JSON.`
            };
        case 'video':
            return {
                planning: `You are an AI film director. Analyze this concept for a short video.
Concept: "${concept}"
${refinementText}
Provide a brief strategy and an enhanced prompt for a key visual/storyboard still. Describe the scene, lighting, and composition. Output as JSON.`,
                planning_schema: { type: "object", properties: { strategy: { type: "string" }, enhanced_prompt: { type: "string" } } },
                generation_is_image: true, // For video, we generate a keyframe image as a proxy
                review: (genPrompt) => `You are an AI film critic. Assess this generated video keyframe.
Original Concept: "${concept}"
Enhanced Prompt Used: "${genPrompt}"
Provide a quality score (1-10), assessment, and 2-3 specific suggestions for improvement if needed. Output as JSON.`
            };
        case 'music':
            return {
                planning: `You are an AI music composer. Analyze this concept for a musical piece.
Concept: "${concept}"
${refinementText}
Provide a brief strategy and an enhanced prompt for a musical composition description (mood, tempo, instruments, style, and lyrics if applicable). Output as JSON.`,
                planning_schema: { type: "object", properties: { strategy: { type: "string" }, enhanced_prompt: { type: "string" } } },
                generation_invoke_llm: true, // Flag to indicate using InvokeLLM for generation
                generation_prompt_builder: (prompt) => `Generate a description of a musical composition and lyrics based on this prompt: ${prompt}`,
                generation_schema: { type: "object", properties: { composition: { type: "string" } } },
                review: (genPrompt) => `You are an AI music critic. Assess this generated composition.
Original Concept: "${concept}"
Enhanced Prompt Used: "${genPrompt}"
Provide a quality score (1-10), assessment, and 2-3 specific suggestions for improvement if needed. Output as JSON.`
            };
        default: // image
            return {
                planning: `You are a creative AI art director. Analyze this concept for an image.
Concept: "${concept}"
${refinementText}
Provide:
1. A brief strategy for how to approach this concept
2. An enhanced, detailed prompt optimized for image generation (be very descriptive, include artistic style, lighting, composition, colors, mood, etc.)

Output as JSON.`,
                planning_schema: { type: "object", properties: { strategy: { type: "string" }, enhanced_prompt: { type: "string" } } },
                generation_is_image: true, // Flag to indicate using GenerateImage
                review: (genPrompt) => `You are an AI art critic and quality assessment agent. Analyze this generated image concept and provide feedback.
Original Concept: "${concept}"
Enhanced Prompt Used: "${genPrompt}"

Provide:
1. A quality score (1-10)
2. A brief assessment of how well it matches the concept
3. 2-3 specific suggestions for improvement if needed

Output as JSON.`
            };
    }
};

export default function OrchestrationPage() {
    const [currentGeneration, setCurrentGeneration] = useState(null);
    const [workflowState, setWorkflowState] = useState({
        stage: null,
        modality: null, // New field for modality
        planningData: null,
        analysisData: null,
        startTime: null,
    });
    const queryClient = useQueryClient(); // Initialize useQueryClient

    const orchestrateMutation = useMutation({
        mutationFn: async ({ concept, modality, isRefinement = false }) => {
            const startTime = Date.now();
            setWorkflowState({ stage: "planning", modality, planningData: null, analysisData: null, startTime });

            const prompts = getPrompts(modality, concept, isRefinement);

            // Stage 1: Planning Agent
            const planningResult = await base44.integrations.Core.InvokeLLM({
                prompt: prompts.planning,
                response_json_schema: prompts.planning_schema,
            });

            setWorkflowState(prev => ({ ...prev, stage: "generating", planningData: planningResult }));

            // Stage 2: Generation Agent
            let generated_output;
            if (prompts.generation_is_image) {
                const imageResult = await base44.integrations.Core.GenerateImage({ prompt: planningResult.enhanced_prompt });
                generated_output = { image_url: imageResult.url };
            } else if (prompts.generation_invoke_llm) {
                generated_output = await base44.integrations.Core.InvokeLLM({
                    prompt: prompts.generation_prompt_builder(planningResult.enhanced_prompt),
                    response_json_schema: prompts.generation_schema,
                });
            } else {
                throw new Error("Invalid generation method specified for modality.");
            }

            setWorkflowState(prev => ({ ...prev, stage: "analyzing" }));

            // Stage 3: Review Agent
            const analysisResult = await base44.integrations.Core.InvokeLLM({
                prompt: prompts.review(planningResult.enhanced_prompt),
                response_json_schema: { type: "object", properties: { quality_score: { type: "number" }, assessment: { type: "string" }, suggestions: { type: "array", items: { type: "string" } } } },
            });

            const duration = (Date.now() - startTime) / 1000;
            setWorkflowState(prev => ({ ...prev, stage: "completed", analysisData: analysisResult }));

            // Save to database
            const generation = await base44.entities.Generation.create({
                concept,
                modality, // Save modality
                planning_output: planningResult,
                enhanced_prompt: planningResult.enhanced_prompt,
                generated_output, // Use the dynamically generated output
                analysis: analysisResult,
                workflow_duration: duration,
                status: "completed",
            });

            queryClient.invalidateQueries({ queryKey: ['generations'] }); // Invalidate cache for generations
            return generation;
        },
        onSuccess: (data) => {
            setCurrentGeneration(data);
        },
        onError: (error) => {
            console.error("Orchestration failed:", error);
            setWorkflowState(prev => ({ ...prev, stage: 'failed' })); // Set workflow stage to failed
        }
    });

    const handleSubmit = (concept, modality) => { // Accept modality from ConceptInput
        setCurrentGeneration(null); // Clear previous generation on new submission
        orchestrateMutation.mutate({ concept, modality });
    };

    const handleRefine = () => {
        if (currentGeneration) {
            orchestrateMutation.mutate({
                concept: `${currentGeneration.concept} (refined based on feedback: ${currentGeneration.analysis.suggestions.join(', ')})`,
                modality: currentGeneration.modality, // Pass current modality for refinement
                isRefinement: true
            });
        }
    };

    const handleReset = () => {
        setCurrentGeneration(null);
        setWorkflowState({ stage: null, modality: null, planningData: null, analysisData: null, startTime: null }); // Reset modality
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        AI Orchestration Lab
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Experience multi-agent collaboration: Watch planning, generation, and review agents work together to bring your ideas to life
                    </p>
                </div>

                {/* Main Content */}
                {/* Adjusted conditional rendering for ConceptInput */}
                {!workflowState.stage && (
                    <div className="max-w-3xl mx-auto">
                        <ConceptInput
                            onSubmit={handleSubmit}
                            isProcessing={orchestrateMutation.isPending}
                        />
                    </div>
                )}

                {workflowState.stage && (
                    <div className="space-y-8">
                        <WorkflowPipeline
                            currentStage={workflowState.stage}
                            modality={workflowState.modality} // Pass modality to WorkflowPipeline
                            planningData={workflowState.planningData}
                            analysisData={workflowState.analysisData}
                        />

                        {currentGeneration && workflowState.stage === "completed" && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <ResultDisplay
                                    generation={currentGeneration} // Pass the full generation object
                                    onRefine={handleRefine}
                                    isRefining={orchestrateMutation.isPending}
                                />

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-slate-600 hover:text-slate-900 underline"
                                    >
                                        Start New Orchestration
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Display for failed state */}
                        {workflowState.stage === 'failed' && (
                            <div className="max-w-md mx-auto text-center p-6 bg-red-100 border border-red-300 rounded-lg">
                                <h3 className="text-red-800 font-semibold">Orchestration Failed</h3>
                                <p className="text-red-700 text-sm mt-2">An unexpected error occurred. Please try again or check the console for details.</p>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-red-600 hover:text-red-900 underline mt-4"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Panel */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                        <h3 className="font-semibold text-lg mb-4">How This Orchestration Works</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                    1
                                </div>
                                <h4 className="font-medium">Planning Agent</h4>
                                <p className="text-slate-600">Analyzes your concept and creates a detailed execution strategy with enhanced prompts</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    2
                                </div>
                                <h4 className="font-medium">Generation Agent</h4>
                                <p className="text-slate-600">Uses the enhanced prompt to generate high-quality visual, audio, or text output</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                                    3
                                </div>
                                <h4 className="font-medium">Review Agent</h4>
                                <p className="text-slate-600">Critically analyzes the result and provides improvement suggestions for refinement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
