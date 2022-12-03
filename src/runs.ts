import { db } from "./main";
import { Run, ResultStatus, Preset, Dataset, Record } from "./types";
import { providerToClass } from "./providers";
import { renderTemplate } from "./util/string";

export function makeStartingRunMessage(run: Run): string {
  return `Starting <strong>${run.name}</strong>. Do not leave this page until the run is complete or it will be cancelled.`;
}

export function startRun({
  run,
  onStart,
  onUpdate,
  onError,
  onComplete,
}: {
  run: Run;
  onStart?: () => void;
  onUpdate?: (run: Run) => void;
  onError?: (err: any) => void;
  onComplete?: (run: Run) => void;
}) {
  const update = (run: Run) => {
    db.updateRun(run);
    if (onUpdate) {
      onUpdate(run);
    }
  };
  // If run already has results, confirm
  const status = run.getStatus();
  if (status.status === ResultStatus.completed) {
    const confirm = window.confirm(
      "This run has already been completed. Starting it again will overwrite the existing results. Are you sure you want to continue?"
    );
    if (!confirm) {
      return;
    }
  }
  onStart && onStart();
  run.resetResults();
  update(run);
  const dataset = db
    .getDatasets()
    .find((dataset: Dataset) => dataset.id === run.datasetId);
  const records = db
    .getRecords()
    .filter((record: Record) => record.datasetId === run.datasetId);
  const preset = db
    .getPresets()
    .find((preset: Preset) => preset.id === run.presetId);
  if (!dataset || !preset) {
    return;
  }
  const prompt = preset.getPrompt();
  if (!prompt.hasPlaceholder()) {
    const err = new Error("Prompt does not have a placeholder");
    onError && onError(err);
  }
  const settings = preset.getLanguageModelSettings();
  const modelClass = providerToClass[settings.provider];
  const langModel = new modelClass(settings.apiSettings);
  const promises = records.map((record: Record) => {
    const promptText = renderTemplate(prompt.text, { text: record.text });
    return langModel
      .getSuggestions(promptText)
      .then((res: { data: any; text: string }) => {
        const text = res.text;
        const result = { text, status: ResultStatus.completed };
        run.results[record.id!] = result;
        update(run);
      })
      .catch((err: any) => {
        run.results[record.id!] = {
          text: err.message,
          status: ResultStatus.failed,
        };
        db.updateRun(run);
        onError && onError(err);
      });
  });
  Promise.all(promises).then(() => {
    onComplete && onComplete(run);
  });
}

export function exportRun({ run }: { run: Run }) {
  const dataset = db
    .getDatasets()
    .find((dataset: Dataset) => dataset.id === run.datasetId);
  const records = db
    .getRecords()
    .filter((record: Record) => record.datasetId === run.datasetId);
  if (!dataset || !records) {
    return;
  }
  const resultsFormatted = run.formatResults();
  const text = records.map((record: Record) => {
    let result = resultsFormatted[record.id!];
    result.text = `${record.text}${result.text}`;
    result.text = result.text.replace(/\\n/g, "\n");
    result.text = result.text.trimEnd();
    return result.text;
  });
  const blob = new Blob([text.join("\n\n---\n\n")], {
    type: "text/plain;charset=utf-8",
  });
  // Trigger download
  const element = document.createElement("a");
  element.href = URL.createObjectURL(blob);
  element.download = `${dataset.name}-${run.id}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
