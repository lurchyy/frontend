import { useState, useEffect } from "react";
import React from "react";
import { ChevronDown, ArrowRight, X, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const chatModels = ["Chat GPT", "Claude AI", "Gemini", "Other"];

const providers = ["ChatGPT", "Claude", "Grok", "Gemini"] as const;

const providerModels: Record<(typeof providers)[number], string[]> = {
  ChatGPT: ["GPT-4o", "GPT-4", "GPT-3.5"],
  Claude: ["Claude Opus 4", "Claude Sonnet 3", "Claude Haiku"],
  Grok: ["Grok-1.5", "Grok-1"],
  Gemini: ["Gemini 1.5 Pro", "Gemini 1.0 Pro"],
};

const recommendedModels: Record<(typeof providers)[number], string> = {
  ChatGPT: "GPT-4o",
  Claude: "Claude Opus 4",
  Grok: "Grok-1.5",
  Gemini: "Gemini 1.5 Pro",
};

const PromptGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [selectedModel, setSelectedModel] = useState("Chat GPT");
  const [selectedProvider, setSelectedProvider] =
    useState<(typeof providers)[number]>("ChatGPT");
  const [selectedProviderModel, setSelectedProviderModel] = useState(
    providerModels["ChatGPT"][0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [subUseCases, setSubUseCases] = useState<string[]>([]);
  const [selectedSubUseCase, setSelectedSubUseCase] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [sectorsData, setSectorsData] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isFillingVariables, setIsFillingVariables] = useState(false);
  const [showPromptInRight, setShowPromptInRight] = useState(true);

  useEffect(() => {
    fetch("/sectors.json")
      .then((res) => res.json())
      .then((data) => {
        setSectorsData(data.sectors);
        // Always add 'Something else' to industries
        const sectorList = data.sectors.map((s: any) => s.sector);
        if (!sectorList.includes("Something else")) {
          sectorList.push("Something else");
        }
        setIndustries(sectorList);
      })
      .catch((error) => {
        console.error("Error loading sectors.json:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedIndustry && sectorsData.length > 0) {
      const found = sectorsData.find((s) => s.sector === selectedIndustry);
      const useCaseList = found
        ? found.use_cases.map((u: any) => u.use_case)
        : [];
      if (!useCaseList.includes("Something else")) {
        useCaseList.push("Something else");
      }
      setUseCases(useCaseList);
    } else {
      setUseCases(["Something else"]);
    }
  }, [selectedIndustry, sectorsData]);

  useEffect(() => {
    if (selectedIndustry && selectedUseCase) {
      axios
        .get(`${API_URL}/sub-use-cases`, {
          params: { sector: selectedIndustry, use_case: selectedUseCase },
        })
        .then((res) => {
          setSubUseCases(res.data.sub_use_cases || []);
        })
        .catch((err) => {
          console.error("Error fetching sub use cases:", err);
          setSubUseCases([]);
        });
    } else {
      setSubUseCases([]);
    }
  }, [selectedIndustry, selectedUseCase]);

  const handleProviderChange = (value: (typeof providers)[number]) => {
    setSelectedProvider(value);
    const models = providerModels[value];
    setSelectedProviderModel(models[0]);
  };

  const handleGenerate = async (sub?: string) => {
    setError("");
    setGeneratedPrompt("");
    setVariables([]);
    setVariableValues({});
    setIsFillingVariables(false);
    if (!selectedIndustry || !selectedUseCase) return;
    try {
      const response = await axios.post(`${API_URL}/prompt-universal`, {
        sector: selectedIndustry,
        use_case: selectedUseCase,
        ...(sub ? { sub_use_case: sub } : {}),
        user_input: inputText,
      });
      const { prompt_template, use_case, variables } = response.data;
      const titlePart = sub || use_case;
      setPromptTitle(`Generated Prompt for ${titlePart}`);
      if (variables && variables.length > 0) {
        setVariables(variables);
        setVariableValues(Object.fromEntries(variables.map((v) => [v, ""])));
        setGeneratedPrompt(prompt_template);
        setIsFillingVariables(true);
      } else {
        setGeneratedPrompt(prompt_template);
        setVariables([]);
        setVariableValues({});
        setIsFillingVariables(false);
        setIsModalOpen(true);
      }
    } catch (err) {
      setError("Error generating prompt. Please try again.");
      setGeneratedPrompt("");
      setVariables([]);
      setVariableValues({});
      setIsFillingVariables(false);
      setIsModalOpen(false);
      console.error("Error generating prompt:", err);
    }
  };

  const handleSubUseCaseClick = async (name: string) => {
    setSelectedSubUseCase(name);
    await handleGenerate(name);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFillVariables = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${API_URL}/prompt-fill-variables`, {
        prompt_template: generatedPrompt,
        variables: variableValues,
      });
      let finalPrompt = response.data.final_prompt;
      if (typeof finalPrompt !== "string") {
        if (finalPrompt && typeof finalPrompt === "object") {
          finalPrompt = JSON.stringify(finalPrompt, null, 2);
        } else {
          finalPrompt = "Prompt is not a string.";
        }
      }
      setGeneratedPrompt(finalPrompt);
      setVariables([]);
      setVariableValues({});
      setIsFillingVariables(false);
      setIsModalOpen(true); // Only open modal after variables are filled
    } catch (err) {
      setError("Error filling variables. Please try again.");
      console.error("Error filling variables:", err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
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
            Generate sophisticated prompts for finance analysis & market
            research.
          </p>
        </div>

        {/* Main Form */}
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1 border border-border rounded-2xl p-8 bg-card shadow-sm">
            <div className="space-y-6">
            {/* Text Input */}
            <Textarea
              placeholder="Add a company name, business goal, or specify anything else"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] text-lg border-0 bg-transparent resize-none placeholder:text-muted-foreground focus-visible:ring-0 p-0"
              disabled={isFillingVariables}
            />

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Industry Select */}
                <Select
                  value={selectedIndustry}
                  onValueChange={setSelectedIndustry}
                  disabled={isFillingVariables}
                >
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
                <Select
                  value={selectedUseCase}
                  onValueChange={setSelectedUseCase}
                  disabled={isFillingVariables}
                >
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
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={isFillingVariables}
                >
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
                  disabled={
                    isFillingVariables ||
                    !selectedIndustry ||
                    // Only disable if sector is not selected
                    // Allow submit if:
                    // (1) both sector and use case are selected
                    // (2) sector and input is provided
                    // (3) sector, use case, and input is provided
                    // So, disable only if sector is not selected
                    false
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 w-10 p-0 disabled:opacity-30"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Variable Fill Form (inline, as a step) */}
            {isFillingVariables && variables.length > 0 && (
              <form onSubmit={handleFillVariables} className="space-y-4 mt-8">
                <h4 className="font-semibold text-foreground">
                  Fill in required fields:
                </h4>
                {variables.map((name) => (
                  <div key={name} className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      {name}
                    </label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={variableValues[name] || ""}
                      onChange={(e) =>
                        handleVariableChange(name, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
                <Button type="submit" className="mt-2 bg-primary text-white">
                  Fill Prompt
                </Button>
                {error && (
                  <div className="text-red-600 text-xs mt-2">{error}</div>
                )}
              </form>
            )}
            </div>
          </Card>
          {subUseCases.length > 0 && (
            <Card className="lg:w-72 border border-border rounded-2xl p-4 h-fit bg-card shadow-sm">
              <h4 className="font-semibold mb-3 text-foreground">Top Sub Use Cases</h4>
              <ul className="space-y-2">
                {subUseCases.map((su) => (
                  <li key={su}>
                    <button
                      onClick={() => handleSubUseCaseClick(su)}
                      className="text-left text-sm text-primary hover:underline w-full"
                    >
                      {su}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

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
                  Here's your custom prompt, tailored to the use case, industry,
                  and the additional context you provided.
                </p>

                {/* Clickable Prompt Heading */}
                <Card
                  className="p-4 mb-8 bg-muted/20 border border-border cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setShowPromptInRight(true)}
                >
                  <h3 className="font-semibold text-foreground text-lg">
                    {promptTitle}
                  </h3>
                </Card>

                {/* Variable Fill Form */}
                {isFillingVariables && variables.length > 0 && (
                  <form
                    onSubmit={handleFillVariables}
                    className="space-y-4 mb-8"
                  >
                    <h4 className="font-semibold text-foreground">
                      Fill in required fields:
                    </h4>
                    {variables.map((name) => (
                      <div key={name} className="space-y-1">
                        <label className="text-sm font-medium text-foreground">
                          {name}
                        </label>
                        <input
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={variableValues[name] || ""}
                          onChange={(e) =>
                            handleVariableChange(name, e.target.value)
                          }
                          required
                        />
                      </div>
                    ))}
                    <Button
                      type="submit"
                      className="mt-2 bg-primary text-white"
                    >
                      Fill Prompt
                    </Button>
                  </form>
                )}
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
                        <h4 className="font-medium text-foreground mb-3">
                          Where to use this prompt?
                        </h4>
                        <Card className="p-4 bg-muted/20 border border-border">
                          <Select
                            value={selectedProvider}
                            onValueChange={handleProviderChange}
                          >
                            <SelectTrigger className="w-full bg-transparent border-0 text-foreground hover:bg-muted/50">
                              <SelectValue placeholder="Select Provider" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                              {providers.map((provider) => (
                                <SelectItem
                                  key={provider}
                                  value={provider}
                                  className="hover:bg-muted cursor-pointer"
                                >
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
                        <h4 className="font-medium text-foreground mb-3">
                          Select a {selectedProvider} model
                        </h4>
                        <Card className="p-4 bg-muted/20 border border-border">
                          <Select
                            value={selectedProviderModel}
                            onValueChange={setSelectedProviderModel}
                          >
                            <SelectTrigger className="w-full bg-transparent border-0 text-foreground hover:bg-muted/50">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border rounded-lg shadow-lg">
                              {providerModels[selectedProvider].map((model) => (
                                <SelectItem
                                  key={model}
                                  value={model}
                                  className="hover:bg-muted cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span>{model}</span>
                                    {recommendedModels[selectedProvider] ===
                                      model && (
                                      <span className="text-xs text-muted-foreground">
                                        Recommended model
                                      </span>
                                    )}
                                  </div>
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
                        <h4 className="font-medium text-foreground">
                          Paste The Prompt You Just Generated
                        </h4>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          Submit The Prompt
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Generated Prompt */}
              <div className="w-1/2 p-6 overflow-y-auto relative">
                {showPromptInRight ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        {promptTitle}
                      </h3>
                    </div>

                    <div className="prose prose-sm max-w-none text-foreground">
                      {typeof generatedPrompt === "string" ? (
                        <ReactMarkdown>{generatedPrompt}</ReactMarkdown>
                      ) : (
                        <span className="text-red-600 text-xs">
                          Prompt is not a string. Please try again.
                        </span>
                      )}
                    </div>

                    {/* Copy button at bottom right */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-6 right-6 h-8 w-8 p-0 hover:bg-muted"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <span className="text-green-600 font-medium text-xs">
                          Copied!
                        </span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>
                      Click on the prompt title on the left to view the
                      generated prompt
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PromptGenerator;
