
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Wand2, Eye, CheckCircle2, Loader2 } from "lucide-react";

const getGenerationStage = (modality) => {
    switch (modality) {
        case 'audio': return { title: "Audio Synthesis", description: "Generating voiceover script" };
        case 'video': return { title: "Video Generation", description: "Creating storyboard & keyframe" };
        case 'music': return { title: "Music Composition", description: "Generating composition & lyrics" };
        default: return { title: "Image Generation", description: "Creating visual from prompt" };
    }
}

export default function WorkflowPipeline({ currentStage, modality, planningData, analysisData }) {
    const generationStageInfo = getGenerationStage(modality);

    const stages = [
        {
            id: "planning",
            title: "Planning Agent",
            description: "Analyzing concept & creating strategy",
            icon: Brain,
            color: "from-blue-500 to-cyan-500",
        },
        {
            id: "generating",
            title: generationStageInfo.title,
            description: generationStageInfo.description,
            icon: Wand2,
            color: "from-purple-500 to-pink-500",
        },
        {
            id: "analyzing",
            title: "Review Agent",
            description: "Analyzing results & suggesting improvements",
            icon: Eye,
            color: "from-orange-500 to-red-500",
        },
        {
            id: "completed",
            title: "Completed",
            description: "Orchestration pipeline finished",
            icon: CheckCircle2,
            color: "from-green-500 to-emerald-500",
        },
    ];

    const getCurrentStageIndex = () => {
        return stages.findIndex(s => s.id === currentStage);
    };

    const currentIndex = getCurrentStageIndex();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`p-6 relative overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-purple-500 shadow-lg' :
                                isCompleted ? 'bg-green-50' :
                                    'opacity-60'
                                }`}>
                                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stage.color}`} />

                                <div className="flex items-start gap-3">
                                    <div className={`p-3 rounded-xl ${isActive ? `bg-gradient-to-br ${stage.color}` :
                                        isCompleted ? 'bg-green-500' :
                                            'bg-slate-200'
                                        }`}>
                                        {isActive && <Loader2 className="w-5 h-5 text-white animate-spin" />}
                                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                                        {isPending && <Icon className="w-5 h-5 text-slate-500" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm mb-1">{stage.title}</h3>
                                        <p className="text-xs text-slate-600">{stage.description}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Stage Details */}
            {planningData && currentIndex >= 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-600" />
                            Planning Agent Output
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium text-slate-700">Strategy:</span>
                                <p className="text-slate-600 mt-1">{planningData.strategy}</p>
                            </div>
                            <div>
                                <span className="font-medium text-slate-700">Enhanced Prompt for Generation:</span>
                                <p className="text-slate-600 mt-1 italic">{planningData.enhanced_prompt}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {analysisData && currentIndex >= 3 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-orange-600" />
                            Review Agent Analysis
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-slate-700">Quality Score:</span>
                                <p className="text-slate-600 mt-1">{analysisData.quality_score}/10</p>
                            </div>
                            <div>
                                <span className="font-medium text-slate-700">Assessment:</span>
                                <p className="text-slate-600 mt-1">{analysisData.assessment}</p>
                            </div>
                            {analysisData.suggestions && analysisData.suggestions.length > 0 && (
                                <div>
                                    <span className="font-medium text-slate-700">Improvement Suggestions:</span>
                                    <ul className="list-disc list-inside text-slate-600 mt-1 space-y-1">
                                        {analysisData.suggestions.map((suggestion, idx) => (
                                            <li key={idx}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
