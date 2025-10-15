import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, RefreshCw, Mic, Clapperboard, Music } from "lucide-react";
import ReactMarkdown from "react-markdown";

const TextResult = ({ title, content, icon: Icon, color }) => (
    <div className={`p-6 border-l-4 ${color}`}>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Icon className="w-5 h-5" />{title}</h3>
        <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    </div>
);

export default function ResultDisplay({ generation, onRefine, isRefining }) {
    if (!generation) return null;

    const { modality, generated_output, concept } = generation;

    const handleDownload = () => {
        if (modality === 'image' || modality === 'video') {
            window.open(generated_output.image_url, '_blank');
        }
    };

    const renderOutput = () => {
        switch (modality) {
            case 'image':
            case 'video':
                return (
                    <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800">
                        <img
                            src={generated_output.image_url}
                            alt={concept}
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                            {modality === 'video' ? 'Video Keyframe' : 'Generated Image'}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleDownload}
                                className="bg-white/90 hover:bg-white backdrop-blur-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleDownload}
                                className="bg-white/90 hover:bg-white backdrop-blur-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 'audio':
                return <TextResult title="Generated Audio Script" content={generated_output.script} icon={Mic} color="border-blue-500 bg-blue-50" />;
            case 'music':
                return <TextResult title="Generated Musical Composition" content={generated_output.composition} icon={Music} color="border-green-500 bg-green-50" />;
            default:
                return <div className="p-6">Unsupported modality.</div>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-none shadow-2xl">
                <CardContent className="p-0">
                    {renderOutput()}

                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                        <h3 className="font-semibold text-lg mb-2">Generated Output</h3>
                        <p className="text-slate-600 text-sm mb-4">{concept}</p>

                        <Button
                            onClick={onRefine}
                            disabled={isRefining}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {isRefining ? (
                                <>Refining...</>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refine with Agent Feedback
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}