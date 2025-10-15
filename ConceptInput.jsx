
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Lightbulb, Image, Mic, Clapperboard, Music } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const exampleConcepts = [
    "A futuristic city powered by renewable energy at sunset",
    "An underwater library where mermaids read ancient books",
    "A cyberpunk cat cafe in Tokyo with neon lights",
    "Abstract representation of quantum entanglement",
];

const modalities = [
    { id: "image", name: "Image", icon: Image },
    { id: "audio", name: "Audio", icon: Mic },
    { id: "video", name: "Video", icon: Clapperboard },
    { id: "music", name: "Music", icon: Music },
];

export default function ConceptInput({ onSubmit, isProcessing }) {
    const [concept, setConcept] = useState("");
    const [modality, setModality] = useState("image");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (concept.trim()) {
            onSubmit(concept.trim(), modality);
        }
    };

    const selectExample = (example) => {
        setConcept(example);
    };

    return (
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    Start Your Creative Journey
                </CardTitle>
                <p className="text-slate-600 text-sm mt-2">
                    Describe any concept, and watch our AI agents collaborate to bring it to life
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Tabs value={modality} onValueChange={setModality} className="w-full mb-4">
                            <TabsList className="grid w-full grid-cols-4 bg-slate-100">
                                {modalities.map(({ id, name, icon: Icon }) => (
                                    <TabsTrigger
                                        key={id}
                                        value={id}
                                        disabled={isProcessing}
                                        className="py-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-inner"
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                        <Textarea
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            placeholder={`Describe your creative vision for the ${modality}...`}
                            className="min-h-32 text-base resize-none border-slate-300 focus:border-purple-500"
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Lightbulb className="w-4 h-4" />
                            <span>Try these examples:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {exampleConcepts.map((example, idx) => (
                                <Button
                                    key={idx}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => selectExample(example)}
                                    disabled={isProcessing}
                                    className="text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                >
                                    {example}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={!concept.trim() || isProcessing}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 text-base"
                    >
                        {isProcessing ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Launch AI Orchestration
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
