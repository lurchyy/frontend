import { useEffect, useState } from "react";
import sectorData from "./sector.json";
import modelData from "./model.json";
import clsx from "clsx";
import { ChevronDown, Copy, MoveRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ClickAwayListener from "react-click-away-listener";
import ReactMarkdown from "react-markdown";

interface Options {
  label: string;
  value: string;
}

interface FormData {
  prompt: string;
  sector: string;
  usecase: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    prompt: "",
    sector: "",
    usecase: "",
  });

  // sector
  const [openSector, setOpenSector] = useState(false);
  const [sectorOptions, setSectorOptions] = useState<Options[]>([]);

  useEffect(() => {
    setSectorOptions(
      sectorData.map((item) => ({
        label: item.sector,
        value: item.sector,
      }))
    );
  }, []);

  const selectedSector = sectorOptions.find(
    (opt) => opt.value === formData.sector
  );

  // use case
  const [openCase, setOpenCase] = useState(false);
  const [caseOptions, setCaseOptions] = useState<Options[]>([]);

  useEffect(() => {
    if (formData.sector !== "" && sectorData) {
      const sector = sectorData.find((s: any) => s.sector === formData.sector);

      handleChange("usecase", "");

      if (!sector) {
        setCaseOptions([]);
        return;
      }

      const result = sector.use_cases.map((uc: any) => ({
        label: uc.use_case,
        value: uc.description,
      }));

      setCaseOptions(result);
    }
  }, [formData.sector]);

  const selectedCase = caseOptions.find(
    (opt) => opt.value === formData.usecase
  );

  // result
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  // form management
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setPrompt("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/prompt-universal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sector: formData.sector,
            use_case: formData.usecase,
            user_input: formData.prompt,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setPrompt(result?.prompt_template);
      } else {
        setError("Error generating prompt.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error generating prompt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // actions
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (err) {
      setCopied(false);
      console.log(err);
    }
  };

  // steps
  const [model, setModel] = useState("ChatGPT");
  const [agent, setAgent] = useState("");

  const [openModel, setOpenModel] = useState(false);
  const [openAgent, setOpenAgent] = useState(false);

  const [allModels, setAllModels] = useState<Options[]>([]);
  const [allAgents, setAllAgents] = useState<Options[]>([]);

  useEffect(() => {
    setAllModels(
      modelData.map((item) => ({
        label: item.model,
        value: item.model,
      }))
    );
  }, []);

  useEffect(() => {
    if (model && modelData) {
      const res = modelData.find((s: any) => s.model === model);

      if (!res) {
        setAllAgents([]);
        return;
      }

      const result = res?.agents.map((uc: any) => ({
        label: uc.agent,
        value: uc.agent,
      }));

      setAllAgents(result);
    }
  }, [model]);

  // defaults
  useEffect(() => {
    if (allModels) {
      setModel(allModels?.[0]?.value);
    }
  }, [allModels]);

  useEffect(() => {
    if (allAgents) {
      setAgent(allAgents?.[0]?.value);
    }
  }, [allAgents]);

  return (
    <div
      className={clsx(
        "ml-auto w-[560px] px-4 pb-16 flex flex-col gap-[62px]",
        prompt.trim() === "" ? "pt-32" : "pt-20"
      )}
    >
      <button
        className="absolute top-[23px] right-[22px]"
        onClick={() => window.close()}
      >
        <X size={32} strokeWidth={1} />
      </button>

      {prompt.trim() === "" && (
        <h1 className="font-[800] text-[36px] leading-none -tracking-[0.04em] text-center">
          PROMPT GENERATOR TOOL
        </h1>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={
            "w-full border border-black rounded-lg pt-4 pl-4.5 pr-6 pb-5 flex flex-col gap-2.5 min-h-[160px] max-h-[200px]"
          }
        >
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            className={
              "w-full min-h-[60px] max-h-[120px] resize-none outline-none font-[500] text-lg leading-none text-black placeholder:text-[#B9B9C3]"
            }
            placeholder="Add a company name, business goal, or anything else"
          />

          <div className="flex items-center gap-3">
            <ClickAwayListener onClickAway={() => setOpenSector(false)}>
              <div className={`relative min-w-[166px] max-w-[212px]`}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSector((prev) => !prev);
                  }}
                  className={clsx(
                    "w-full h-10 px-4 rounded-[36px]",
                    "flex items-center justify-center gap-2",
                    formData.sector !== ""
                      ? "bg-[#EFF2FF] text-[#0000FF]"
                      : "bg-[#F0F0F2]  text-black"
                  )}
                >
                  <p className="font-[500] truncate">
                    {selectedSector?.label || "Select Industry"}
                  </p>

                  <ChevronDown size={20} className="shrink-0" />
                </button>

                <AnimatePresence>
                  {openSector && (
                    <motion.ul
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={clsx(
                        "min-w-[256px] absolute z-10 w-full mt-1 bg-white max-h-60 overflow-auto",
                        "border border-[#D0D5DC] rounded-[10px] px-3 py-2 shadow"
                      )}
                    >
                      {sectorOptions.map((opt) => (
                        <li
                          key={opt.value}
                          onClick={() => {
                            handleChange("sector", opt.value);
                            setOpenSector(false);
                          }}
                          className={clsx(
                            "w-full transition-all ease-in-out duration-500 rounded-md",
                            "px-4 py-2 hover:bg-[#EDEDEE] cursor-pointer font-medium",
                            opt.value === formData.sector
                              ? "bg-[#EDEDEE] text-[#0000FF]"
                              : "text-[#303339]"
                          )}
                        >
                          {opt.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </ClickAwayListener>

            <ClickAwayListener onClickAway={() => setOpenCase(false)}>
              <div className={`relative min-w-[180px] max-w-[222px]`}>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.sector === "") return;
                    setOpenCase((prev) => !prev);
                  }}
                  className={clsx(
                    "w-full h-10 px-4 rounded-[36px]",
                    "flex items-center justify-center gap-2",
                    formData.usecase !== ""
                      ? "bg-[#EFF2FF] text-[#0000FF]"
                      : "bg-[#F0F0F2]  text-black"
                  )}
                >
                  <p className="font-[500] truncate">
                    {selectedCase?.label || "Select Use Case"}
                  </p>

                  <ChevronDown size={20} className="shrink-0" />
                </button>

                <AnimatePresence>
                  {openCase && (
                    <motion.ul
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={clsx(
                        "min-w-[256px] absolute z-10 w-full mt-1 bg-white max-h-60 overflow-auto",
                        "border border-[#D0D5DC] rounded-[10px] px-3 py-2 shadow"
                      )}
                    >
                      {caseOptions.map((opt) => (
                        <li
                          key={opt.value}
                          onClick={() => {
                            handleChange("usecase", opt.value);
                            setOpenCase(false);
                          }}
                          className={clsx(
                            "w-full transition-all ease-in-out duration-500 rounded-md",
                            "px-4 py-2 hover:bg-[#EDEDEE] cursor-pointer font-medium",
                            opt.value === formData.usecase
                              ? "bg-[#EDEDEE] text-[#0000FF]"
                              : "text-[#303339]"
                          )}
                        >
                          {opt.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </ClickAwayListener>
          </div>
        </div>

        <button
          type="submit"
          className={clsx(
            "w-full h-12 flex items-center justify-center gap-2.5 rounded-md text-white",
            "transition-all ease-in-out duration-500",
            formData.prompt.trim() === "" || formData.sector.trim() === ""
              ? "bg-[#DEDEDE]  !cursor-default"
              : "bg-[#0000FF]"
          )}
        >
          <p className="font-[500] leading-none">
            {isSubmitting ? "GENERATING..." : "GENERATE"}
          </p>

          <MoveRight size={24} />
        </button>

        {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
      </form>

      {prompt && (
        <div className="flex flex-col gap-12">
          <p className="font-[700] text-xl leading-none text-[#0F0F0F]">
            Generated Prompt:
          </p>

          <ReactMarkdown>{prompt}</ReactMarkdown>

          <button className="w-fit hover:bg-muted" onClick={handleCopy}>
            <Copy
              className={clsx(
                "h-6 w-6",
                copied ? "text-green-500 animate-bounce" : "text-black"
              )}
            />
          </button>
        </div>
      )}

      <div className="mt-14 space-y-6">
        <h3 className="font-medium text-[#686A7B] uppercase tracking-[1px]">
          STEPS TO USE THIS PROMPT:
        </h3>

        <div className="space-y-4">
          {/* Step One */}
          <div className="flex items-start gap-6 pb-6">
            <div
              className={clsx(
                "shrink-0 w-6 h-6 border border-[#D6DAE0] text-primary rounded-full",
                "flex items-center justify-center text-sm font-medium"
              )}
            >
              1
            </div>

            <div className="w-full flex flex-col gap-7">
              <h4 className="font-[700] text-xl leading-none -tracking-[0.02em] capitalize">
                Where to use this prompt?
              </h4>

              <ClickAwayListener onClickAway={() => setOpenModel(false)}>
                <div className={`relative w-full`}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenModel((prev) => !prev);
                    }}
                    className={clsx(
                      "w-full h-16 px-7 rounded-xl",
                      "flex items-center justify-between gap-2",
                      "border border-[#D6D6D6]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <p className="font-[700] text-lg">
                        {model || "AI Model"}
                      </p>

                      {model === "Claude AI" && (
                        <div className="border border-[#EFEFFF] p-2 rounded font-[500] text-xs text-[#0000FF] leading-nonep">
                          Recommended
                        </div>
                      )}
                    </div>

                    <ChevronDown size={20} className="shrink-0" />
                  </button>

                  <AnimatePresence>
                    {openModel && (
                      <motion.ul
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={clsx(
                          "min-w-[256px] absolute z-10 w-full mt-1 bg-white max-h-60 overflow-auto",
                          "border border-[#D0D5DC] rounded-[10px] px-3 py-2 shadow"
                        )}
                      >
                        {allModels.map((opt) => (
                          <li
                            key={opt.value}
                            onClick={() => {
                              setModel(opt.value);
                              setOpenModel(false);
                            }}
                            className={clsx(
                              "w-full transition-all ease-in-out duration-500 rounded-md",
                              "px-4 py-2 hover:bg-[#EDEDEE] cursor-pointer font-medium",
                              opt.value === model
                                ? "bg-[#EDEDEE] text-[#0000FF]"
                                : "text-[#303339]"
                            )}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </ClickAwayListener>
            </div>
          </div>

          {/* Step Two */}
          <div className="flex items-start gap-6 pb-6">
            <div
              className={clsx(
                "shrink-0 w-6 h-6 border border-[#D6DAE0] text-primary rounded-full",
                "flex items-center justify-center text-sm font-medium"
              )}
            >
              2
            </div>

            <div className="w-full flex flex-col gap-7">
              <h4 className="font-[700] text-xl leading-none -tracking-[0.02em] capitalize">
                Select a {model} model
              </h4>

              <ClickAwayListener onClickAway={() => setOpenAgent(false)}>
                <div className={`relative w-full`}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenAgent((prev) => !prev);
                    }}
                    className={clsx(
                      "w-full h-16 px-7 rounded-xl",
                      "flex items-center justify-between gap-2",
                      "border border-[#D6D6D6]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <p className="font-[700] text-lg">
                        {agent || "AI Agent"}
                      </p>

                      {agent === "Claude Opus 4" && (
                        <div className="border border-[#EFEFFF] p-2 rounded font-[500] text-xs text-[#0000FF] leading-nonep">
                          Recommended
                        </div>
                      )}
                    </div>

                    <ChevronDown size={20} className="shrink-0" />
                  </button>

                  <AnimatePresence>
                    {openAgent && (
                      <motion.ul
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={clsx(
                          "min-w-[256px] absolute z-10 w-full mt-1 bg-white max-h-60 overflow-auto",
                          "border border-[#D0D5DC] rounded-[10px] px-3 py-2 shadow"
                        )}
                      >
                        {allAgents.map((opt) => (
                          <li
                            key={opt.value}
                            onClick={() => {
                              setAgent(opt.value);
                              setOpenAgent(false);
                            }}
                            className={clsx(
                              "w-full transition-all ease-in-out duration-500 rounded-md",
                              "px-4 py-2 hover:bg-[#EDEDEE] cursor-pointer font-medium",
                              opt.value === agent
                                ? "bg-[#EDEDEE] text-[#0000FF]"
                                : "text-[#303339]"
                            )}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </ClickAwayListener>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-6 pb-6">
            <div
              className={clsx(
                "shrink-0 w-6 h-6 border border-[#D6DAE0] text-primary rounded-full",
                "flex items-center justify-center text-sm font-medium"
              )}
            >
              3
            </div>

            <div className="flex-1">
              <h4 className="font-[700] text-xl -tracking-[0.02em] capitalize">
                Paste The Prompt You Just Generated
              </h4>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-6">
            <div
              className={clsx(
                "shrink-0 w-6 h-6 border border-[#D6DAE0] text-primary rounded-full",
                "flex items-center justify-center text-sm font-medium"
              )}
            >
              4
            </div>

            <div className="flex-1">
              <h4 className="font-[700] text-xl -tracking-[0.02em] capitalize">
                Submit The Prompt
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
