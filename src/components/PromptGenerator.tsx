import { useState } from "react";
import { ChevronDown, ArrowRight, X, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const industries = [
  "Private Equity",
  "Hedge Funds",
  "Venture Capitalist",
  "Investment Banks",
  "Crypto Funds"
];

const useCases = [
  "Select Use Case",
  "Summarising Earnings Call",
  "Summarise Expert Call",
  "Market Analysis",
  "Due Diligence"
];

const chatModels = [
  "Chat GPT",
  "Claude AI",
  "Gemini",
  "Other"
];

const providers = ["ChatGPT", "Claude", "Grok", "Gemini"] as const;

const providerModels: Record<(typeof providers)[number], string[]> = {
  ChatGPT: ["GPT-4o", "GPT-4", "GPT-3.5"],
  Claude: ["Claude Opus 4", "Claude Sonnet 3", "Claude Haiku"],
  Grok: ["Grok-1.5", "Grok-1"],
  Gemini: ["Gemini 1.5 Pro", "Gemini 1.0 Pro"],
};

const PromptGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [selectedModel, setSelectedModel] = useState("Chat GPT");
  const [selectedProvider, setSelectedProvider] = useState<(typeof providers)[number]>("ChatGPT");
  const [selectedProviderModel, setSelectedProviderModel] = useState(providerModels["ChatGPT"][0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptTitle, setPromptTitle] = useState("");

  const handleProviderChange = (value: (typeof providers)[number]) => {
    setSelectedProvider(value);
    const models = providerModels[value];
    setSelectedProviderModel(models[0]);
  };

  const handleGenerate = () => {
    if (!inputText.trim() || !selectedIndustry || !selectedUseCase) return;

    const title = `Customer Acquisition Strategy Analysis: ${selectedIndustry}${selectedUseCase !== "Select Use Case" ? ` & ${selectedUseCase} Summary` : ""}`;
    setPromptTitle(title);

    const prompt = `Analyze the ${selectedIndustry.toLowerCase()} earnings of call transcript and provide a comprehensive summary focused specifically on customer acquisition strategy. This analysis should serve as a critical tool for investors, analysts, and fund managers looking to understand the fund's growth trajectory and competitive positioning in the marketplace.

Structure your response to address key customer acquisition highlights, beginning with quantitative metrics such as new client onboarding numbers, conversion rates from prospects to committed capital, and year-over-year growth in client base. Examine geographic expansion efforts, identifying new markets entered, regional performance variations, and international growth opportunities. Analyze target client segments, distinguishing between institutional investors (pension funds, endowments, sovereign wealth funds) versus high-net-worth individuals, and assess any shifts in client mix strategy.

Strategic initiatives should cover:
• Marketing and business development investments, including headcount additions and budget allocations
• Digital platform enhancements designed to improve client experience and attract tech-savvy investors  
• Fee structure modifications to enhance competitiveness while maintaining profitability
• Product innovation initiatives, including new fund launches or strategy diversification

Evaluate performance metrics comprehensively, focusing on assets under management (AUM) growth attributable to new clients versus existing client contributions..`;

    setGeneratedPrompt(prompt);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            PROMPT GENERATOR TOOL
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate sophisticated prompts for finance analysis & market research.
          </p>
        </div>

        {/* Main Form */}
        <Card className="w-full border border-border rounded-2xl p-8 bg-card shadow-sm">
          <div className="space-y-6">
            {/* Text Input */}
            <Textarea
              placeholder="Add a company name, business goal, or specify anything else"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] text-lg border-0 bg-transparent resize-none placeholder:text-muted-foreground focus-visible:ring-0 p-0"
            />

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Industry Select */}
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="bg-transparent border-0 text-primary font-medium hover:bg-muted/50 h-10 min-w-[140px]">
                    <SelectValue placeholder="Select Industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                    {industries.map((industry) => (
                      <SelectItem
                        key={industry}
                        value={industry}
                        className="hover:bg-muted cursor-pointer"
                      >
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Use Case Select */}
                <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
                  <SelectTrigger className="bg-transparent border-0 text-primary font-medium hover:bg-muted/50 h-10 min-w-[160px]">
                    <SelectValue placeholder="Select Use Case" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                    {useCases.map((useCase) => (
                      <SelectItem
                        key={useCase}
                        value={useCase}
                        className="hover:bg-muted cursor-pointer"
                      >
                        {useCase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                {/* Chat Model Select */}
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-transparent border-0 text-foreground hover:bg-muted/50 h-10 min-w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                    {chatModels.map((model) => (
                      <SelectItem
                        key={model}
                        value={model}
                        className="hover:bg-muted cursor-pointer"
                      >
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || !selectedIndustry || !selectedUseCase}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 w-10 p-0 disabled:opacity-30"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Generated Prompt Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-card border border-border p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {promptTitle}
              </DialogTitle>
              {/* Remove manual close/cross buttons to avoid duplicates; use Dialog's default close if available */}
            </div>

            {/* Two Column Layout */}
            <div className="flex h-full">
              {/* Left Column - Steps */}
              <div className="w-1/2 p-6 overflow-y-auto border-r border-border">
                <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
                  Here's your custom prompt, tailored to the use case, industry, and the additional context you provided.
                </p>

                {/* Prompt Preview Card */}
                <Card className="p-4 mb-8 bg-muted/20 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-lg">
                      Customer Acquisition Strategy Analysis: Hedge Fund Earnings Call Summary
                    </h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Prompt</span>
                </Card>

                {/* Steps Section */}
                <div className="space-y-6 overflow-y-auto max-h-[60vh]">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    STEPS TO USE THIS PROMPT:
                  </h3>

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-3">Where to use this prompt?</h4>
                        <Card className="p-4 bg-muted/20 border border-border">
                          <Select value={selectedProvider} onValueChange={handleProviderChange}>
                            <SelectTrigger className="w-full bg-transparent border-0 text-foreground hover:bg-muted/50">
                              <SelectValue placeholder="Select Provider" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                              {providers.map((provider) => (
                                <SelectItem key={provider} value={provider} className="hover:bg-muted cursor-pointer">
                                  {provider}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Card>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-3">Select a {selectedProvider} model</h4>
                        <Card className="p-4 bg-muted/20 border border-border">
                          <Select value={selectedProviderModel} onValueChange={setSelectedProviderModel}>
                            <SelectTrigger className="w-full bg-transparent border-0 text-foreground hover:bg-muted/50">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                              {providerModels[selectedProvider].map((model) => (
                                <SelectItem key={model} value={model} className="hover:bg-muted cursor-pointer">
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Card>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">Paste The Prompt You Just Generated</h4>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">Submit The Prompt</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Generated Prompt */}
              <div className="w-1/2 p-6 overflow-y-auto relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-foreground">{promptTitle}</h3>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-foreground leading-relaxed mb-4">
                      {generatedPrompt}
                    </p>
                  </div>
                </div>

                {/* Copy button at bottom right */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-6 right-6 h-8 w-8 p-0 hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PromptGenerator;