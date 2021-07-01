declare interface IConfigJSON {
  mutationTypeName: string;
  stateTypeName: string;
  declareFileName?: string;
  declareFilePath?: string;
  needTemplate?: boolean;
  templateStyle: "nuxt" | "normal";
}  