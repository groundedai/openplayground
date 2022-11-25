import { getDatasets } from "./db/datasets";
import { getLanguageModelSettings } from "./db/language-model-settings";
import { getPromptTemplates } from "./db/prompt-templates";
import { getRecords } from "./db/records";
import { Run, ResultStatus } from "./types";
import { updateRun } from "./db/runs";
import { providerToClass } from "./providers";
import { renderTemplate } from "./util/string";

export function startRun({
  run,
  onUpdate,
  onError,
  onComplete,
}: {
  run: Run;
  onUpdate?: (run: Run) => void;
  onError?: (err: any) => void;
  onComplete?: (run: Run) => void;
}) {
  const update = (run: Run) => {
    updateRun(run);
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
  run.resetResults();
  update(run);
  const dataset = getDatasets().find((dataset) => dataset.id === run.datasetId);
  const records = getRecords().filter(
    (record) => record.datasetId === run.datasetId
  );
  const template = getPromptTemplates().find(
    (template) => template.id === run.templateId
  );
  const settings = getLanguageModelSettings().find(
    (settings) => settings.id === run.languageModelSettingsId
  );
  if (!dataset || !template || !settings) {
    return;
  }
  const langModelClass = providerToClass[settings.provider];
  const langModel = new langModelClass(settings.settings);
  const promises = records.map((record) => {
    const prompt = renderTemplate(template.template, { text: record.text });
    return langModel
      .getSuggestions(prompt)
      .then((res: { data: any; text: string }) => {
        const text = res.text;
        const result = { text, status: ResultStatus.completed };
        run.results[record.id] = result;
        update(run);
      })
      .catch((err: any) => {
        run.results[record.id] = {
          text: err.message,
          status: ResultStatus.failed,
        };
        updateRun(run);
        onError && onError(err);
      });
  });
  Promise.all(promises).then(() => {
    onComplete && onComplete(run);
  });
}

export function exportRun({ run }: { run: Run }) {
  const dataset = getDatasets().find((dataset) => dataset.id === run.datasetId);
  const records = getRecords().filter(
    (record) => record.datasetId === run.datasetId
  );
  if (!dataset || !records) {
    return;
  }
  const resultsFormatted = run.getFormattedResults();
  const text = records.map((record) => {
    let result = resultsFormatted[record.id];
    result.text = `${record.text}${result.text}`;
    result.text = result.text.replace(/\\n/g, "\n");
    result.text = result.text.trimEnd();
    return result;
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
