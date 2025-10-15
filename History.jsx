import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Sparkles, TrendingUp, Image, Mic, Clapperboard, Music } from "lucide-react";
import { format } from "date-fns";

const modalityIcons = {
    image: Image,
    audio: Mic,
    video: Clapperboard,
    music: Music,
};

export default function HistoryPage() {
    const { data: generations, isLoading, error } = useQuery({
        queryKey: ['generations'],
        queryFn: () => base44.entities.Generation.list("-created_date"),
        initialData: [],
        retry: 2,
        staleTime: 30000,
    });

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl text-red-600">Error loading generations</h2>
                    <p className="text-slate-600">{error.message}</p>
                </div>
            </div>
        );
    }

    const avgDuration = generations?.length > 0
        ? (generations.reduce((sum, g) => sum + (g.workflow_duration || 0), 0) / generations.length).toFixed(2)
        : 0;

    const avgQuality = generations?.length > 0
        ? (generations.reduce((sum, g) => sum + (g.analysis?.quality_score || 0), 0) / generations.length).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        Generation History
                    </h1>
                    <p className="text-slate-600">
                        Review all your AI orchestration outputs and analytics
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Generations</p>
                                    <p className="text-3xl font-bold text-slate-900">{generations.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Avg Duration</p>
                                    <p className="text-3xl font-bold text-slate-900">{avgDuration}s</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Avg Quality</p>
                                    <p className="text-3xl font-bold text-slate-900">{avgQuality}/10</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <Card key={i} className="overflow-hidden animate-pulse">
                                <div className="aspect-video bg-slate-200" />
                                <CardContent className="p-4">
                                    <div className="h-4 bg-slate-200 rounded mb-2" />
                                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                                </CardContent>
                            </Card>
                        ))
                    ) : generations.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <Sparkles className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-600 text-lg">No generations yet</p>
                            <p className="text-slate-500 text-sm mt-2">Start creating to see your history here</p>
                        </div>
                    ) : (
                        generations.map((gen, index) => {
                            const ModalityIcon = modalityIcons[gen.modality] || Sparkles;
                            return (
                                <motion.div
                                    key={gen.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-none shadow-lg">
                                        <div className="relative aspect-video bg-slate-900">
                                            {(gen.modality === 'image' || gen.modality === 'video') && gen.generated_output?.image_url ? (
                                                <img
                                                    src={gen.generated_output.image_url}
                                                    alt={gen.concept}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 p-4">
                                                    <p className="text-slate-400 text-sm line-clamp-4 italic">
                                                        {gen.modality === 'audio' && gen.generated_output?.script ? gen.generated_output.script :
                                                            gen.modality === 'music' && gen.generated_output?.composition ? gen.generated_output.composition :
                                                                gen.modality === 'video' && gen.generated_output?.script ? gen.generated_output.script :
                                                                    gen.concept} {/* Fallback to concept if output is not available for non-image/video */}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-full">
                                                <ModalityIcon className="w-4 h-4 text-slate-700" />
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                                                    {gen.analysis?.quality_score || 'N/A'}/10
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="font-medium text-slate-900 mb-2 line-clamp-2">
                                                {gen.concept}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>{format(new Date(gen.created_date), 'MMM d, yyyy')}</span>
                                                <span>{gen.workflow_duration?.toFixed(1)}s</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
